import { create } from 'zustand'
import { AgentTemplate, WorkflowTemplate } from '@/types/template'

interface TemplateStore {
  agentTemplates: AgentTemplate[]
  workflowTemplates: WorkflowTemplate[]
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchAgentTemplates: () => Promise<void>
  fetchWorkflowTemplates: () => Promise<void>
  createAgentFromTemplate: (templateId: string, customizations?: any) => Promise<string>
  createWorkflowFromTemplate: (templateId: string, customizations?: any) => Promise<any>
}

export const useTemplateStore = create<TemplateStore>((set, get) => ({
  agentTemplates: [],
  workflowTemplates: [],
  isLoading: false,
  error: null,

  fetchAgentTemplates: async () => {
    set({ isLoading: true, error: null })
    try {
      // Mock agent templates for now
      const templates: AgentTemplate[] = [
        {
          id: 'customer-support-agent',
          name: 'Customer Support Agent',
          description: 'AI agent that handles customer inquiries, provides support, and escalates complex issues',
          category: 'customer-service',
          difficulty: 'beginner',
          tags: ['support', 'chat', 'helpdesk', 'customer-service'],
          icon: '🎧',
          estimatedSetupTime: '10 minutes',
          useCases: [
            'Handle common customer questions',
            'Provide product information',
            'Escalate complex issues to human agents',
            'Collect customer feedback'
          ],
          features: [
            'Natural language understanding',
            'Knowledge base integration',
            'Sentiment analysis',
            'Escalation workflows'
          ],
          agentConfig: {
            name: 'Customer Support Agent',
            description: 'Friendly and helpful customer support agent that provides excellent customer service',
            type: 'llm',
            persona: 'You are a helpful and empathetic customer support agent. You provide clear, accurate information and always maintain a professional yet friendly tone. You listen carefully to customer concerns and provide solutions or escalate when necessary.',
            primaryObjective: 'Assist customers with their inquiries and provide excellent support experience while maintaining high satisfaction levels',
            tools: ['550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'], // Web Search, Email Sender
            workflow: {
              nodes: [
                {
                  id: 'start',
                  type: 'start',
                  position: { x: 100, y: 100 },
                  data: { label: 'Customer Inquiry' }
                },
                {
                  id: 'intent-analysis',
                  type: 'llm',
                  position: { x: 300, y: 100 },
                  data: {
                    label: 'Analyze Intent',
                    config: {
                      model: 'gpt-3.5-turbo',
                      systemPrompt: 'Analyze the customer inquiry and categorize the intent as: question, complaint, request, compliment, or urgent. Also determine the sentiment and urgency level.',
                      temperature: 0.3
                    }
                  }
                },
                {
                  id: 'knowledge-search',
                  type: 'tool',
                  position: { x: 500, y: 100 },
                  data: {
                    label: 'Search Knowledge Base',
                    config: {
                      toolId: '550e8400-e29b-41d4-a716-446655440001',
                      toolName: 'Web Search',
                      toolType: 'ai',
                      parameters: [
                        {
                          id: 'query',
                          name: 'query',
                          type: 'string',
                          required: true,
                          description: 'The search query'
                        }
                      ],
                      parameterValues: {
                        query: '{{input.message}} customer support help'
                      }
                    }
                  }
                },
                {
                  id: 'response-generation',
                  type: 'llm',
                  position: { x: 700, y: 100 },
                  data: {
                    label: 'Generate Response',
                    config: {
                      model: 'gpt-3.5-turbo',
                      systemPrompt: 'Generate a helpful, empathetic customer support response based on the intent analysis and knowledge base results. Be professional, friendly, and solution-oriented.',
                      temperature: 0.7
                    }
                  }
                },
                {
                  id: 'end',
                  type: 'end',
                  position: { x: 900, y: 100 },
                  data: { label: 'Response Sent' }
                }
              ],
              edges: [
                { id: 'e1', source: 'start', target: 'intent-analysis' },
                { id: 'e2', source: 'intent-analysis', target: 'knowledge-search' },
                { id: 'e3', source: 'knowledge-search', target: 'response-generation' },
                { id: 'e4', source: 'response-generation', target: 'end' }
              ],
              settings: {
                timeout: 60,
                retries: 2,
                parallelism: 1,
                logging: true
              }
            }
          },
          requiredApiKeys: ['openai'],
          setupInstructions: [
            {
              id: 'api-key',
              title: 'Configure OpenAI API Key',
              description: 'Add your OpenAI API key to enable LLM functionality',
              type: 'api-key',
              required: true,
              estimatedTime: '2 minutes'
            },
            {
              id: 'knowledge-base',
              title: 'Set up Knowledge Base',
              description: 'Configure your knowledge base or FAQ data source',
              type: 'config',
              required: false,
              estimatedTime: '5 minutes'
            },
            {
              id: 'test',
              title: 'Test the Agent',
              description: 'Run a test conversation to verify everything works',
              type: 'test',
              required: true,
              estimatedTime: '3 minutes'
            }
          ],
          isPopular: true,
          createdAt: '2025-01-27T00:00:00Z',
          updatedAt: '2025-01-27T00:00:00Z'
        },
        {
          id: 'content-writer-agent',
          name: 'Content Writer Agent',
          description: 'AI agent that creates high-quality content for blogs, social media, and marketing materials',
          category: 'content-creation',
          difficulty: 'intermediate',
          tags: ['writing', 'content', 'blog', 'marketing', 'social-media'],
          icon: '✍️',
          estimatedSetupTime: '15 minutes',
          useCases: [
            'Generate blog posts and articles',
            'Create social media content',
            'Write marketing copy',
            'Produce product descriptions'
          ],
          features: [
            'Multi-format content generation',
            'SEO optimization',
            'Brand voice consistency',
            'Research integration'
          ],
          agentConfig: {
            name: 'Content Writer Agent',
            description: 'Creative and strategic content writer that produces engaging, high-quality content',
            type: 'llm',
            persona: 'You are a skilled content writer with expertise in creating engaging, informative, and SEO-optimized content across various formats and industries. You understand brand voice, target audiences, and content strategy.',
            primaryObjective: 'Create high-quality, engaging content that meets specific requirements, follows brand guidelines, and achieves marketing objectives',
            tools: ['550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003'], // Web Search, HTTP Request
            workflow: {
              nodes: [
                {
                  id: 'start',
                  type: 'start',
                  position: { x: 100, y: 100 },
                  data: { label: 'Content Request' }
                },
                {
                  id: 'research',
                  type: 'tool',
                  position: { x: 300, y: 100 },
                  data: {
                    label: 'Research Topic',
                    config: {
                      toolId: '550e8400-e29b-41d4-a716-446655440001',
                      toolName: 'Web Search',
                      toolType: 'ai',
                      parameters: [
                        {
                          id: 'query',
                          name: 'query',
                          type: 'string',
                          required: true,
                          description: 'The search query'
                        }
                      ],
                      parameterValues: {
                        query: '{{input.topic}} latest trends research'
                      }
                    }
                  }
                },
                {
                  id: 'outline',
                  type: 'llm',
                  position: { x: 500, y: 100 },
                  data: {
                    label: 'Create Outline',
                    config: {
                      model: 'gpt-4',
                      systemPrompt: 'Create a detailed content outline based on the research and requirements. Include main points, subheadings, and key messages.',
                      temperature: 0.7
                    }
                  }
                },
                {
                  id: 'content',
                  type: 'llm',
                  position: { x: 700, y: 100 },
                  data: {
                    label: 'Write Content',
                    config: {
                      model: 'gpt-4',
                      systemPrompt: 'Write engaging, high-quality content based on the outline and research. Follow the specified tone, style, and format requirements.',
                      temperature: 0.8
                    }
                  }
                },
                {
                  id: 'end',
                  type: 'end',
                  position: { x: 900, y: 100 },
                  data: { label: 'Content Ready' }
                }
              ],
              edges: [
                { id: 'e1', source: 'start', target: 'research' },
                { id: 'e2', source: 'research', target: 'outline' },
                { id: 'e3', source: 'outline', target: 'content' },
                { id: 'e4', source: 'content', target: 'end' }
              ],
              settings: {
                timeout: 120,
                retries: 2,
                parallelism: 1,
                logging: true
              }
            }
          },
          requiredApiKeys: ['openai'],
          setupInstructions: [
            {
              id: 'api-key',
              title: 'Configure OpenAI API Key',
              description: 'Add your OpenAI API key for content generation',
              type: 'api-key',
              required: true,
              estimatedTime: '2 minutes'
            },
            {
              id: 'brand-guidelines',
              title: 'Set Brand Guidelines',
              description: 'Configure your brand voice and style preferences',
              type: 'config',
              required: false,
              estimatedTime: '10 minutes'
            },
            {
              id: 'test',
              title: 'Generate Sample Content',
              description: 'Test the agent with a sample content request',
              type: 'test',
              required: true,
              estimatedTime: '3 minutes'
            }
          ],
          isPopular: true,
          createdAt: '2025-01-27T00:00:00Z',
          updatedAt: '2025-01-27T00:00:00Z'
        },
        {
          id: 'data-analyst-agent',
          name: 'Data Analyst Agent',
          description: 'AI agent that analyzes data, generates insights, and creates reports',
          category: 'data-analysis',
          difficulty: 'advanced',
          tags: ['data', 'analytics', 'reports', 'insights', 'visualization'],
          icon: '📊',
          estimatedSetupTime: '25 minutes',
          useCases: [
            'Analyze business metrics',
            'Generate automated reports',
            'Identify trends and patterns',
            'Create data visualizations'
          ],
          features: [
            'Statistical analysis',
            'Trend identification',
            'Report generation',
            'Data visualization'
          ],
          agentConfig: {
            name: 'Data Analyst Agent',
            description: 'Expert data analyst that uncovers insights and generates comprehensive reports',
            type: 'hybrid',
            persona: 'You are an experienced data analyst who excels at finding meaningful insights in data and presenting them in clear, actionable ways. You understand statistical concepts and can communicate complex findings to non-technical audiences.',
            primaryObjective: 'Analyze data to uncover insights, identify trends, and generate comprehensive reports that drive business decisions',
            tools: ['550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001'], // HTTP Request, Web Search
            workflow: {
              nodes: [
                {
                  id: 'start',
                  type: 'start',
                  position: { x: 100, y: 100 },
                  data: { label: 'Data Request' }
                },
                {
                  id: 'data-fetch',
                  type: 'tool',
                  position: { x: 300, y: 100 },
                  data: {
                    label: 'Fetch Data',
                    config: {
                      toolId: '550e8400-e29b-41d4-a716-446655440003',
                      toolName: 'HTTP Request',
                      toolType: 'api',
                      parameters: [
                        {
                          id: 'url',
                          name: 'url',
                          type: 'string',
                          required: true,
                          description: 'The URL to make the request to'
                        },
                        {
                          id: 'headers',
                          name: 'headers',
                          type: 'object',
                          required: false,
                          description: 'Request headers'
                        }
                      ],
                      parameterValues: {
                        url: '{{input.dataSource}}',
                        headers: '{{input.headers}}'
                      }
                    }
                  }
                },
                {
                  id: 'analysis',
                  type: 'llm',
                  position: { x: 500, y: 100 },
                  data: {
                    label: 'Analyze Data',
                    config: {
                      model: 'gpt-4',
                      systemPrompt: 'Analyze the provided data and identify key trends, patterns, anomalies, and insights. Perform statistical analysis where appropriate.',
                      temperature: 0.3
                    }
                  }
                },
                {
                  id: 'report',
                  type: 'llm',
                  position: { x: 700, y: 100 },
                  data: {
                    label: 'Generate Report',
                    config: {
                      model: 'gpt-4',
                      systemPrompt: 'Create a comprehensive data analysis report with insights, recommendations, and actionable next steps. Include executive summary and detailed findings.',
                      temperature: 0.5
                    }
                  }
                },
                {
                  id: 'end',
                  type: 'end',
                  position: { x: 900, y: 100 },
                  data: { label: 'Report Generated' }
                }
              ],
              edges: [
                { id: 'e1', source: 'start', target: 'data-fetch' },
                { id: 'e2', source: 'data-fetch', target: 'analysis' },
                { id: 'e3', source: 'analysis', target: 'report' },
                { id: 'e4', source: 'report', target: 'end' }
              ],
              settings: {
                timeout: 180,
                retries: 3,
                parallelism: 1,
                logging: true
              }
            }
          },
          requiredApiKeys: ['openai'],
          setupInstructions: [
            {
              id: 'api-key',
              title: 'Configure OpenAI API Key',
              description: 'Add your OpenAI API key for data analysis',
              type: 'api-key',
              required: true,
              estimatedTime: '2 minutes'
            },
            {
              id: 'data-sources',
              title: 'Configure Data Sources',
              description: 'Set up connections to your data sources and APIs',
              type: 'config',
              required: true,
              estimatedTime: '15 minutes'
            },
            {
              id: 'analysis-templates',
              title: 'Set Analysis Templates',
              description: 'Configure report templates and analysis frameworks',
              type: 'config',
              required: false,
              estimatedTime: '5 minutes'
            },
            {
              id: 'test',
              title: 'Run Sample Analysis',
              description: 'Test the agent with sample data',
              type: 'test',
              required: true,
              estimatedTime: '3 minutes'
            }
          ],
          isPopular: false,
          createdAt: '2025-01-27T00:00:00Z',
          updatedAt: '2025-01-27T00:00:00Z'
        }
      ]

      set({ agentTemplates: templates, isLoading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch agent templates', 
        isLoading: false 
      })
    }
  },

  fetchWorkflowTemplates: async () => {
    set({ isLoading: true, error: null })
    try {
      // Mock workflow templates for now
      const templates: WorkflowTemplate[] = [
        {
          id: 'email-automation',
          name: 'Email Automation Workflow',
          description: 'Automated email processing and response workflow',
          category: 'automation',
          complexity: 'simple',
          tags: ['email', 'automation', 'response'],
          icon: '📧',
          estimatedExecutionTime: '30 seconds',
          workflow: {
            nodes: [
              {
                id: 'start',
                type: 'start',
                position: { x: 100, y: 100 },
                data: { label: 'Email Received' }
              },
              {
                id: 'classify',
                type: 'llm',
                position: { x: 300, y: 100 },
                data: {
                  label: 'Classify Email',
                  config: {
                    model: 'gpt-3.5-turbo',
                    systemPrompt: 'Classify the email as: urgent, normal, spam, or inquiry. Also determine the appropriate response type.',
                    temperature: 0.2
                  }
                }
              },
              {
                id: 'route',
                type: 'rule',
                position: { x: 500, y: 100 },
                data: {
                  label: 'Route Email',
                  config: {
                    condition: 'input.contains("urgent")',
                    action: 'continue'
                  }
                }
              },
              {
                id: 'auto-reply',
                type: 'tool',
                position: { x: 700, y: 50 },
                data: {
                  label: 'Send Auto Reply',
                  config: {
                    toolId: '550e8400-e29b-41d4-a716-446655440002',
                    toolName: 'Email Sender',
                    toolType: 'email',
                    parameters: [
                      {
                        id: 'to',
                        name: 'to',
                        type: 'string',
                        required: true,
                        description: 'Recipient email address'
                      },
                      {
                        id: 'subject',
                        name: 'subject',
                        type: 'string',
                        required: true,
                        description: 'Email subject'
                      },
                      {
                        id: 'body',
                        name: 'body',
                        type: 'string',
                        required: true,
                        description: 'Email body content'
                      }
                    ],
                    parameterValues: {
                      to: '{{input.from}}',
                      subject: 'Re: {{input.subject}}',
                      body: 'Thank you for your email. We have received your message and will respond shortly.'
                    }
                  }
                }
              },
              {
                id: 'escalate',
                type: 'tool',
                position: { x: 700, y: 150 },
                data: {
                  label: 'Escalate to Human',
                  config: {
                    toolId: '550e8400-e29b-41d4-a716-446655440002',
                    toolName: 'Email Sender',
                    toolType: 'email',
                    parameters: [
                      {
                        id: 'to',
                        name: 'to',
                        type: 'string',
                        required: true,
                        description: 'Recipient email address'
                      },
                      {
                        id: 'subject',
                        name: 'subject',
                        type: 'string',
                        required: true,
                        description: 'Email subject'
                      },
                      {
                        id: 'body',
                        name: 'body',
                        type: 'string',
                        required: true,
                        description: 'Email body content'
                      }
                    ],
                    parameterValues: {
                      to: 'support@company.com',
                      subject: 'URGENT: {{input.subject}}',
                      body: 'Urgent email requires human attention: {{input.body}}'
                    }
                  }
                }
              },
              {
                id: 'end',
                type: 'end',
                position: { x: 900, y: 100 },
                data: { label: 'Email Processed' }
              }
            ],
            edges: [
              { id: 'e1', source: 'start', target: 'classify' },
              { id: 'e2', source: 'classify', target: 'route' },
              { id: 'e3', source: 'route', target: 'auto-reply' },
              { id: 'e4', source: 'route', target: 'escalate' },
              { id: 'e5', source: 'auto-reply', target: 'end' },
              { id: 'e6', source: 'escalate', target: 'end' }
            ],
            settings: {
              timeout: 60,
              retries: 2,
              parallelism: 1,
              logging: true
            }
          },
          requiredTools: ['550e8400-e29b-41d4-a716-446655440002'], // Email Sender
          inputSchema: {
            type: 'object',
            properties: {
              from: { type: 'string' },
              subject: { type: 'string' },
              body: { type: 'string' }
            },
            required: ['from', 'subject', 'body']
          },
          outputSchema: {
            type: 'object',
            properties: {
              classification: { type: 'string' },
              action: { type: 'string' },
              response: { type: 'string' }
            }
          },
          usageExamples: [
            {
              title: 'Customer Inquiry',
              description: 'Processing a customer support inquiry',
              input: {
                from: 'customer@example.com',
                subject: 'Question about my order',
                body: 'Hi, I have a question about my recent order #12345...'
              },
              expectedOutput: {
                classification: 'inquiry',
                action: 'auto-reply',
                response: 'Thank you for your inquiry. We will respond within 24 hours.'
              }
            }
          ],
          isPopular: true,
          createdAt: '2025-01-27T00:00:00Z',
          updatedAt: '2025-01-27T00:00:00Z'
        },
        {
          id: 'content-pipeline',
          name: 'Content Creation Pipeline',
          description: 'End-to-end content creation and publishing workflow',
          category: 'content-creation',
          complexity: 'moderate',
          tags: ['content', 'writing', 'publishing', 'seo'],
          icon: '📝',
          estimatedExecutionTime: '5 minutes',
          workflow: {
            nodes: [
              {
                id: 'start',
                type: 'start',
                position: { x: 100, y: 100 },
                data: { label: 'Content Brief' }
              },
              {
                id: 'research',
                type: 'tool',
                position: { x: 300, y: 100 },
                data: {
                  label: 'Research Topic',
                  config: {
                    toolId: '550e8400-e29b-41d4-a716-446655440001',
                    toolName: 'Web Search',
                    toolType: 'ai',
                    parameters: [
                      {
                        id: 'query',
                        name: 'query',
                        type: 'string',
                        required: true,
                        description: 'The search query'
                      }
                    ],
                    parameterValues: {
                      query: '{{input.topic}} latest trends 2025'
                    }
                  }
                }
              },
              {
                id: 'outline',
                type: 'llm',
                position: { x: 500, y: 100 },
                data: {
                  label: 'Create Outline',
                  config: {
                    model: 'gpt-4',
                    systemPrompt: 'Create a detailed content outline based on the research and target audience. Include main sections, key points, and SEO considerations.',
                    temperature: 0.7
                  }
                }
              },
              {
                id: 'write',
                type: 'llm',
                position: { x: 700, y: 100 },
                data: {
                  label: 'Write Content',
                  config: {
                    model: 'gpt-4',
                    systemPrompt: 'Write engaging, high-quality content based on the outline. Match the specified tone and target the intended audience.',
                    temperature: 0.8
                  }
                }
              },
              {
                id: 'seo-optimize',
                type: 'llm',
                position: { x: 900, y: 100 },
                data: {
                  label: 'SEO Optimize',
                  config: {
                    model: 'gpt-3.5-turbo',
                    systemPrompt: 'Optimize the content for SEO by adding meta descriptions, improving keyword density, and suggesting internal links.',
                    temperature: 0.5
                  }
                }
              },
              {
                id: 'end',
                type: 'end',
                position: { x: 1100, y: 100 },
                data: { label: 'Content Ready' }
              }
            ],
            edges: [
              { id: 'e1', source: 'start', target: 'research' },
              { id: 'e2', source: 'research', target: 'outline' },
              { id: 'e3', source: 'outline', target: 'write' },
              { id: 'e4', source: 'write', target: 'seo-optimize' },
              { id: 'e5', source: 'seo-optimize', target: 'end' }
            ],
            settings: {
              timeout: 300,
              retries: 2,
              parallelism: 1,
              logging: true
            }
          },
          requiredTools: ['550e8400-e29b-41d4-a716-446655440001'], // Web Search
          inputSchema: {
            type: 'object',
            properties: {
              topic: { type: 'string' },
              targetAudience: { type: 'string' },
              keywords: { type: 'array', items: { type: 'string' } },
              wordCount: { type: 'number' }
            },
            required: ['topic']
          },
          outputSchema: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              content: { type: 'string' },
              metaDescription: { type: 'string' },
              keywords: { type: 'array', items: { type: 'string' } }
            }
          },
          usageExamples: [
            {
              title: 'Blog Post Creation',
              description: 'Creating a blog post about AI trends',
              input: {
                topic: 'Latest AI trends in 2025',
                targetAudience: 'Tech professionals',
                keywords: ['AI', 'machine learning', 'trends', '2025'],
                wordCount: 1500
              },
              expectedOutput: {
                title: 'Top 10 AI Trends Shaping 2025: What Tech Professionals Need to Know',
                content: 'Full blog post content...',
                metaDescription: 'Discover the latest AI trends for 2025...',
                keywords: ['AI trends', 'machine learning 2025', 'artificial intelligence']
              }
            }
          ],
          isPopular: true,
          createdAt: '2025-01-27T00:00:00Z',
          updatedAt: '2025-01-27T00:00:00Z'
        }
      ]

      set({ workflowTemplates: templates, isLoading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch workflow templates', 
        isLoading: false 
      })
    }
  },

  createAgentFromTemplate: async (templateId: string, customizations?: any) => {
    const { agentTemplates } = get()
    const template = agentTemplates.find(t => t.id === templateId)
    
    if (!template) {
      throw new Error('Template not found')
    }

    // Import agent store to create the agent
    const { useAgentStore } = await import('./agentStore')
    const { createAgent } = useAgentStore.getState()
    
    const agentData = {
      ...template.agentConfig,
      name: customizations?.name || template.agentConfig.name,
      description: customizations?.description || template.agentConfig.description,
      workflow: {
        ...template.agentConfig.workflow,
        settings: {
          ...template.agentConfig.workflow.settings,
          ...customizations?.workflowSettings
        }
      }
    }

    const agent = await createAgent(agentData)
    return agent.id
  },

  createWorkflowFromTemplate: async (templateId: string, customizations?: any) => {
    const { workflowTemplates } = get()
    const template = workflowTemplates.find(t => t.id === templateId)
    
    if (!template) {
      throw new Error('Template not found')
    }

    return {
      ...template.workflow,
      settings: {
        ...template.workflow.settings,
        ...customizations?.settings
      }
    }
  }
}))