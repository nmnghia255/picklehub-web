window.onload = function () {
  // Build a system
  let url = window.location.search.match(/url=([^&]+)/)
  if (url && url.length > 1) {
    url = decodeURIComponent(url[1])
  } else {
    url = window.location.origin
  }
  let options = {
    swaggerDoc: {
      openapi: "3.0.0",
      paths: {
        "/api/media/images": {
          post: {
            operationId: "AppController_uploadImage",
            parameters: [],
            requestBody: {
              required: true,
              content: {
                "multipart/form-data": {
                  schema: {
                    type: "object",
                    properties: {
                      file: {
                        type: "string",
                        format: "binary",
                        description:
                          "Image file to upload (png, jpeg, jpg). Max size: 5MB",
                      },
                    },
                    required: ["file"],
                  },
                },
              },
            },
            responses: {
              201: {
                description: "Image successfully uploaded",
                content: {
                  "application/json": {
                    schema: {
                      example: {
                        url: "https://res.cloudinary.com/demo/image/upload/v1234567890/picklehub/sample.jpg",
                        publicId: "picklehub/sample",
                        format: "jpg",
                      },
                    },
                  },
                },
              },
              400: {
                description:
                  "Validation failed (e.g., file too large, invalid format, or missing file)",
                content: {
                  "application/json": {
                    schema: {
                      example: {
                        message:
                          "Validation failed (expected size is less than 5242880)",
                        error: "Bad Request",
                        statusCode: 400,
                      },
                    },
                  },
                },
              },
              500: {
                description: "An error occurred during upload to Cloudinary",
                content: {
                  "application/json": {
                    schema: {
                      example: {
                        message: "Unknown Cloudinary Error",
                        error: "Internal Server Error",
                        statusCode: 500,
                      },
                    },
                  },
                },
              },
            },
            summary: "Upload an image to Cloudinary",
            tags: ["media"],
          },
        },
        "/api/media/videos": {
          post: {
            description:
              "Upload a video file in multipart/form-data field `file`. Use this when the client already knows the selected media is a video.",
            operationId: "AppController_uploadVideo",
            parameters: [],
            requestBody: {
              required: true,
              description: "Multipart payload for a video file.",
              content: {
                "multipart/form-data": {
                  schema: {
                    type: "object",
                    properties: {
                      file: {
                        type: "string",
                        format: "binary",
                        description:
                          "Video file to upload. Supported: mp4, mov, webm. Max size: 50MB.",
                      },
                    },
                    required: ["file"],
                  },
                },
              },
            },
            responses: {
              201: {
                description: "Video successfully uploaded",
                content: {
                  "application/json": {
                    schema: {
                      allOf: [
                        {
                          $ref: "#/components/schemas/MediaUploadResponseDto",
                        },
                      ],
                      example: {
                        url: "https://res.cloudinary.com/picklehub/video/upload/v1234567890/picklehub/videos/video-abc123.mp4",
                        publicId: "picklehub/videos/video-abc123",
                        format: "mp4",
                        resourceType: "video",
                      },
                    },
                  },
                },
              },
              400: {
                description:
                  "Validation failed (e.g., file too large, invalid format, or missing file)",
                content: {
                  "application/json": {
                    schema: {
                      example: {
                        message:
                          "Validation failed (expected type is mp4, mov, or webm)",
                        error: "Bad Request",
                        statusCode: 400,
                      },
                    },
                  },
                },
              },
              500: {
                description: "An error occurred during upload to Cloudinary",
                content: {
                  "application/json": {
                    schema: {
                      example: {
                        message: "Unknown Cloudinary Error",
                        error: "Internal Server Error",
                        statusCode: 500,
                      },
                    },
                  },
                },
              },
            },
            summary: "Upload a video to Cloudinary",
            tags: ["media"],
          },
        },
        "/api/media/uploads": {
          post: {
            description:
              "Frontend integration: upload the selected file in multipart/form-data field `file` without asking the user for media type. The backend detects image vs video and uploads with the correct Cloudinary resource type. The returned `url` can be passed to AI endpoints such as `POST /api/ai/analyses/swing` as `imageUrl`.",
            operationId: "AppController_uploadMedia",
            parameters: [],
            requestBody: {
              required: true,
              description: "Multipart payload for an image or video file.",
              content: {
                "multipart/form-data": {
                  schema: {
                    type: "object",
                    properties: {
                      file: {
                        type: "string",
                        format: "binary",
                        description:
                          "Image or video file to upload. Supported: png, jpeg, jpg, mp4, mov, webm. Max size: 5MB for images, 50MB for videos.",
                      },
                    },
                    required: ["file"],
                  },
                },
              },
            },
            responses: {
              201: {
                description: "Media successfully uploaded",
                content: {
                  "application/json": {
                    schema: {
                      allOf: [
                        {
                          $ref: "#/components/schemas/MediaUploadResponseDto",
                        },
                      ],
                      examples: {
                        video: {
                          summary: "Uploaded video response",
                          value: {
                            url: "https://res.cloudinary.com/picklehub/video/upload/v1234567890/picklehub/uploads/video-abc123.mp4",
                            publicId: "picklehub/uploads/video-abc123",
                            format: "mp4",
                            resourceType: "video",
                          },
                        },
                        image: {
                          summary: "Uploaded image response",
                          value: {
                            url: "https://res.cloudinary.com/picklehub/image/upload/v1234567890/picklehub/uploads/image-abc123.jpg",
                            publicId: "picklehub/uploads/image-abc123",
                            format: "jpg",
                            resourceType: "image",
                          },
                        },
                      },
                    },
                  },
                },
              },
              400: {
                description:
                  "Validation failed (e.g., file too large, invalid format, or missing file)",
                content: {
                  "application/json": {
                    schema: {
                      example: {
                        message:
                          "Validation failed (expected type is png, jpeg, jpg, mp4, mov, or webm)",
                        error: "Bad Request",
                        statusCode: 400,
                      },
                    },
                  },
                },
              },
              500: {
                description: "An error occurred during upload to Cloudinary",
                content: {
                  "application/json": {
                    schema: {
                      example: {
                        message: "Unknown Cloudinary Error",
                        error: "Internal Server Error",
                        statusCode: 500,
                      },
                    },
                  },
                },
              },
            },
            summary: "Upload an image or video to Cloudinary",
            tags: ["media"],
          },
        },
        "/api/media/csv": {
          post: {
            operationId: "AppController_uploadCsv",
            parameters: [
              {
                name: "x-internal-service-token",
                required: true,
                in: "header",
                schema: {
                  type: "string",
                },
              },
            ],
            requestBody: {
              required: true,
              content: {
                "multipart/form-data": {
                  schema: {
                    type: "object",
                    properties: {
                      file: {
                        type: "string",
                        format: "binary",
                        description: "CSV file to upload. Max size: 10MB",
                      },
                    },
                    required: ["file"],
                  },
                },
              },
            },
            responses: {
              201: {
                description: "CSV successfully uploaded",
                content: {
                  "application/json": {
                    schema: {
                      example: {
                        url: "https://res.cloudinary.com/demo/raw/upload/v1234567890/picklehub/reports/revenue-report.csv",
                        publicId: "picklehub/reports/revenue-report",
                        format: "csv",
                      },
                    },
                  },
                },
              },
              400: {
                description:
                  "Validation failed (e.g., file too large, invalid format, or missing file)",
              },
              500: {
                description: "An error occurred during upload to Cloudinary",
              },
            },
            summary: "Upload a CSV file to Cloudinary",
            tags: ["media"],
          },
        },
        "/api/media/documents": {
          post: {
            operationId: "AppController_uploadDocument",
            parameters: [],
            requestBody: {
              required: true,
              content: {
                "multipart/form-data": {
                  schema: {
                    type: "object",
                    properties: {
                      file: {
                        type: "string",
                        format: "binary",
                        description:
                          "Document file to upload (pdf only). Max size: 10MB",
                      },
                    },
                    required: ["file"],
                  },
                },
              },
            },
            responses: {
              201: {
                description: "Document successfully uploaded",
                content: {
                  "application/json": {
                    schema: {
                      example: {
                        url: "https://res.cloudinary.com/demo/raw/upload/v1234567890/picklehub/documents/certificate.pdf",
                        publicId: "picklehub/documents/certificate",
                        format: "pdf",
                      },
                    },
                  },
                },
              },
              400: {
                description:
                  "Validation failed (e.g., file too large, invalid format, or missing file)",
              },
              500: {
                description: "An error occurred during upload to Cloudinary",
              },
            },
            summary:
              "Upload a document file to Cloudinary (e.g., for coach certifications)",
            tags: ["media"],
          },
        },
        "/api/media/documents/download": {
          get: {
            operationId: "AppController_downloadDocument",
            parameters: [
              {
                name: "url",
                required: true,
                in: "query",
                schema: {
                  type: "string",
                },
              },
              {
                name: "filename",
                required: true,
                in: "query",
                schema: {
                  type: "string",
                },
              },
            ],
            responses: {
              200: {
                description: "",
              },
            },
            summary:
              "Proxy download for raw documents (bypasses Cloudinary PDF restrictions)",
            tags: ["media"],
          },
        },
        "/api/media/health": {
          get: {
            operationId: "AppController_healthCheck",
            parameters: [],
            responses: {
              200: {
                description: "Service is healthy",
                content: {
                  "application/json": {
                    schema: {
                      example: {
                        status: "ok",
                        service: "media-service",
                        timestamp: "2024-03-05T10:51:28Z",
                      },
                    },
                  },
                },
              },
            },
            summary: "Check service health status",
            tags: ["media"],
          },
        },
      },
      info: {
        title: "PickleHub Media Service",
        description: "REST API for handling media uploads.",
        version: "1.0",
        contact: {},
      },
      tags: [],
      servers: [
        {
          url: "/",
          description: "API Gateway",
        },
      ],
      components: {
        schemas: {
          MediaUploadResponseDto: {
            type: "object",
            properties: {
              url: {
                type: "string",
                description:
                  "Public Cloudinary URL that can be sent to downstream services.",
                example:
                  "https://res.cloudinary.com/picklehub/video/upload/v1234567890/picklehub/uploads/media-abc123.mp4",
              },
              publicId: {
                type: "string",
                description:
                  "Cloudinary public identifier for future transformations or deletion.",
                example: "picklehub/uploads/media-abc123",
              },
              format: {
                type: "string",
                description: "Uploaded asset format returned by Cloudinary.",
                example: "mp4",
              },
              resourceType: {
                type: "string",
                description: "Cloudinary resource type.",
                example: "video",
                enum: ["image", "video", "raw"],
              },
            },
            required: ["url", "publicId", "format", "resourceType"],
          },
        },
      },
    },
    customOptions: {},
  }
  url = options.swaggerUrl || url
  let urls = options.swaggerUrls
  let customOptions = options.customOptions
  let spec1 = options.swaggerDoc
  let swaggerOptions = {
    spec: spec1,
    url: url,
    urls: urls,
    dom_id: "#swagger-ui",
    deepLinking: true,
    presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
    plugins: [SwaggerUIBundle.plugins.DownloadUrl],
    layout: "StandaloneLayout",
  }
  for (let attrname in customOptions) {
    swaggerOptions[attrname] = customOptions[attrname]
  }
  let ui = SwaggerUIBundle(swaggerOptions)

  if (customOptions.initOAuth) {
    ui.initOAuth(customOptions.initOAuth)
  }

  if (customOptions.authAction) {
    ui.authActions.authorize(customOptions.authAction)
  }

  window.ui = ui
}
