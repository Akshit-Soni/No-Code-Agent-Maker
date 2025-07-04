export interface HttpRequestConfig {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: any
  timeout?: number
  retries?: number
  retryDelay?: number
  authentication?: {
    type: 'bearer' | 'basic' | 'api-key'
    token?: string
    username?: string
    password?: string
    apiKey?: string
    apiKeyHeader?: string
  }
}

export interface HttpResponse {
  status: number
  statusText: string
  headers: Record<string, string>
  data: any
  executionTime: number
}

export interface HttpError extends Error {
  status?: number
  response?: HttpResponse
}

export class HttpService {
  private readonly DEFAULT_TIMEOUT = 30000
  private readonly DEFAULT_RETRIES = 3
  private readonly DEFAULT_RETRY_DELAY = 1000
  private readonly MAX_URL_LENGTH = 2048
  private readonly ALLOWED_PROTOCOLS = ['http:', 'https:']

  async makeRequest(config: HttpRequestConfig): Promise<HttpResponse> {
    const startTime = Date.now()
    const maxRetries = config.retries ?? this.DEFAULT_RETRIES
    let lastError: HttpError | null = null

    // Validate and sanitize URL
    this.validateAndSanitizeUrl(config.url)

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.executeRequest(config, startTime)
        return response
      } catch (error) {
        lastError = error as HttpError
        
        // Don't retry on client errors (4xx) or if it's the last attempt
        if (this.shouldNotRetry(lastError) || attempt === maxRetries) {
          break
        }

        // Wait before retrying with exponential backoff
        const delay = (config.retryDelay ?? this.DEFAULT_RETRY_DELAY) * Math.pow(2, attempt)
        await this.sleep(delay)
        
        console.warn(`HTTP request attempt ${attempt + 1} failed, retrying in ${delay}ms:`, lastError.message)
      }
    }

    throw lastError || new Error('HTTP request failed after all retries')
  }

  private validateAndSanitizeUrl(url: string): void {
    if (!url || typeof url !== 'string') {
      throw new Error('URL must be a non-empty string')
    }

    if (url.length > this.MAX_URL_LENGTH) {
      throw new Error(`URL exceeds maximum length of ${this.MAX_URL_LENGTH} characters`)
    }

    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
    } catch {
      throw new Error(`Invalid URL format: ${url}`)
    }

    if (!this.ALLOWED_PROTOCOLS.includes(parsedUrl.protocol)) {
      throw new Error(`Protocol ${parsedUrl.protocol} is not allowed`)
    }

    // Prevent SSRF attacks
    if (this.isPrivateIP(parsedUrl.hostname)) {
      throw new Error('Requests to private IP addresses are not allowed')
    }
  }

  private isPrivateIP(hostname: string): boolean {
    // Check for localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
      return true
    }

    // Check for private IP ranges
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/
    const match = hostname.match(ipv4Regex)
    
    if (match) {
      const [, a, b, c, d] = match.map(Number)
      
      // Private IP ranges
      return (
        (a === 10) ||
        (a === 172 && b >= 16 && b <= 31) ||
        (a === 192 && b === 168) ||
        (a === 169 && b === 254) // Link-local
      )
    }

    return false
  }

  private async executeRequest(config: HttpRequestConfig, startTime: number): Promise<HttpResponse> {
    const { url, method, headers = {}, body, timeout = this.DEFAULT_TIMEOUT } = config

    // Prepare headers with security considerations
    const requestHeaders = { ...headers }
    
    // Add authentication headers
    if (config.authentication) {
      this.addAuthenticationHeaders(requestHeaders, config.authentication)
    }

    // Add content type for requests with body
    if (body && !requestHeaders['Content-Type']) {
      requestHeaders['Content-Type'] = 'application/json'
    }

    // Security headers
    requestHeaders['User-Agent'] = 'AI-Agent-Platform/1.0'

    // Create abort controller for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const requestOptions: RequestInit = {
        method,
        headers: requestHeaders,
        signal: controller.signal
      }

      // Add body for non-GET requests with validation
      if (body && method !== 'GET') {
        if (typeof body === 'string') {
          requestOptions.body = body
        } else {
          try {
            requestOptions.body = JSON.stringify(body)
          } catch (error) {
            throw new Error('Failed to serialize request body')
          }
        }
      }

      const response = await fetch(url, requestOptions)
      clearTimeout(timeoutId)

      const executionTime = Date.now() - startTime
      const responseHeaders = this.extractHeaders(response.headers)
      
      let responseData: any
      try {
        const contentType = response.headers.get('content-type') || ''
        if (contentType.includes('application/json')) {
          responseData = await response.json()
        } else {
          responseData = await response.text()
        }
      } catch (parseError) {
        responseData = null
      }

      const httpResponse: HttpResponse = {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        data: responseData,
        executionTime
      }

      // Check if response indicates an error
      if (!response.ok) {
        const error: HttpError = new Error(`HTTP ${response.status}: ${response.statusText}`)
        error.status = response.status
        error.response = httpResponse
        throw error
      }

      return httpResponse
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          const timeoutError: HttpError = new Error(`Request timeout after ${timeout}ms`)
          timeoutError.status = 408
          throw timeoutError
        }
        
        if (error.message.includes('Failed to fetch')) {
          const networkError: HttpError = new Error('Network error: Unable to reach the server')
          networkError.status = 0
          throw networkError
        }
      }
      
      throw error
    }
  }

  private addAuthenticationHeaders(headers: Record<string, string>, auth: HttpRequestConfig['authentication']): void {
    if (!auth) return

    switch (auth.type) {
      case 'bearer':
        if (auth.token) {
          headers['Authorization'] = `Bearer ${auth.token}`
        }
        break
      
      case 'basic':
        if (auth.username && auth.password) {
          const credentials = btoa(`${auth.username}:${auth.password}`)
          headers['Authorization'] = `Basic ${credentials}`
        }
        break
      
      case 'api-key':
        if (auth.apiKey) {
          const headerName = auth.apiKeyHeader || 'X-API-Key'
          headers[headerName] = auth.apiKey
        }
        break
    }
  }

  private extractHeaders(headers: Headers): Record<string, string> {
    const result: Record<string, string> = {}
    headers.forEach((value, key) => {
      result[key] = value
    })
    return result
  }

  private shouldNotRetry(error: HttpError): boolean {
    // Don't retry on client errors (4xx) except for specific cases
    if (error.status && error.status >= 400 && error.status < 500) {
      // Retry on rate limiting and request timeout
      return ![408, 429].includes(error.status)
    }
    return false
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Utility methods for common HTTP operations
  async get(url: string, config?: Partial<HttpRequestConfig>): Promise<HttpResponse> {
    return this.makeRequest({ ...config, url, method: 'GET' })
  }

  async post(url: string, body?: any, config?: Partial<HttpRequestConfig>): Promise<HttpResponse> {
    return this.makeRequest({ ...config, url, method: 'POST', body })
  }

  async put(url: string, body?: any, config?: Partial<HttpRequestConfig>): Promise<HttpResponse> {
    return this.makeRequest({ ...config, url, method: 'PUT', body })
  }

  async delete(url: string, config?: Partial<HttpRequestConfig>): Promise<HttpResponse> {
    return this.makeRequest({ ...config, url, method: 'DELETE' })
  }

  async patch(url: string, body?: any, config?: Partial<HttpRequestConfig>): Promise<HttpResponse> {
    return this.makeRequest({ ...config, url, method: 'PATCH', body })
  }
}

// Singleton instance
export const httpService = new HttpService()