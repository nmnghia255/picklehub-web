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
        "/health": {
          get: {
            operationId: "AppController_healthCheck",
            parameters: [],
            responses: {
              200: {
                description: "",
              },
            },
            tags: ["App"],
          },
        },
        "/api/sport-centers": {
          post: {
            description: "Creates a new sport center aggregate.",
            operationId: "CenterController_create",
            parameters: [],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/CreateCenterDto",
                  },
                },
              },
            },
            responses: {
              201: {
                description: "Sport center created successfully.",
                content: {
                  "application/json": {
                    schema: {
                      example: {
                        id: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                        ownerId: "b7d5a0ea-d859-4b71-aa34-67c2e668f7a4",
                        name: "PickleHub District 1",
                        address: "123 Nguyen Hue, District 1, Ho Chi Minh City",
                        phone: "+84901234567",
                        email: "hello@pickledome.com",
                        openTime: "06:00",
                        closeTime: "22:00",
                        basePrice: 80000,
                        status: "INACTIVE",
                        amenities: ["Parking", "Shower", "Cafe"],
                        images: ["https://example.com/image1.jpg"],
                        rules: [
                          "Please arrive 10 mins early",
                          "Non-marking shoes only",
                        ],
                        description:
                          "Pickle Dome Sukhumvit is a modern pickleball venue...",
                        paymentAccountName: "NGUYEN VAN AN",
                        paymentAccountNumber: "1234567890",
                        paymentBankName: "VietcomBank",
                        paymentQrUrl:
                          "https://cdn.example.com/qr/sample-qr.png",
                        createdAt: "2026-04-04T08:00:00.000Z",
                        updatedAt: "2026-04-04T08:00:00.000Z",
                        deletedAt: null,
                      },
                    },
                  },
                },
              },
              400: {
                description: "Invalid payload.",
              },
            },
            security: [
              {
                "access-token": [],
              },
            ],
            summary: "Create sport center",
            tags: ["Sport Centers"],
          },
          get: {
            description:
              "Returns active sport center list with limit/offset pagination.",
            operationId: "CenterController_findActive",
            parameters: [
              {
                name: "limit",
                required: false,
                in: "query",
                description: "Pagination limit",
                schema: {
                  minimum: 1,
                  maximum: 100,
                  default: 20,
                  example: 20,
                  type: "number",
                },
              },
              {
                name: "offset",
                required: false,
                in: "query",
                description: "Pagination offset",
                schema: {
                  minimum: 0,
                  default: 0,
                  example: 0,
                  type: "number",
                },
              },
              {
                name: "status",
                required: false,
                in: "query",
                description: "Filter sport centers by status",
                schema: {
                  example: "ACTIVE",
                  type: "string",
                  enum: ["ACTIVE", "INACTIVE"],
                },
              },
              {
                name: "keyword",
                required: false,
                in: "query",
                description: "Search keyword for center name or address",
                schema: {
                  type: "string",
                },
              },
              {
                name: "favouritesOnly",
                required: false,
                in: "query",
                description:
                  "Return only sport centers favourited by the current user",
                schema: {
                  default: false,
                  type: "boolean",
                },
              },
              {
                name: "latitude",
                required: false,
                in: "query",
                description: "Latitude for proximity sorting",
                schema: {
                  type: "number",
                },
              },
              {
                name: "longitude",
                required: false,
                in: "query",
                description: "Longitude for proximity sorting",
                schema: {
                  type: "number",
                },
              },
            ],
            responses: {
              200: {
                description:
                  "Sport center list fetched successfully. Set favouritesOnly=true to return only centres favourited by the current user.",
                content: {
                  "application/json": {
                    schema: {
                      example: {
                        data: [
                          {
                            id: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                            ownerId: "b7d5a0ea-d859-4b71-aa34-67c2e668f7a4",
                            name: "PickleHub District 1",
                            address:
                              "123 Nguyen Hue, District 1, Ho Chi Minh City",
                            phone: "+84901234567",
                            email: "hello@pickledome.com",
                            openTime: "06:00",
                            closeTime: "22:00",
                            basePrice: 80000,
                            status: "ACTIVE",
                            amenities: ["Parking", "Shower", "Cafe"],
                            images: ["https://example.com/image1.jpg"],
                            rules: [
                              "Please arrive 10 mins early",
                              "Non-marking shoes only",
                            ],
                            description:
                              "Pickle Dome Sukhumvit is a modern pickleball venue...",
                            paymentAccountName: "NGUYEN VAN AN",
                            paymentAccountNumber: "1234567890",
                            paymentBankName: "VietcomBank",
                            paymentQrUrl:
                              "https://cdn.example.com/qr/sample-qr.png",
                            createdAt: "2026-04-04T08:00:00.000Z",
                            updatedAt: "2026-04-04T08:00:00.000Z",
                            deletedAt: null,
                            services: [
                              {
                                id: "550e8400-e29b-41d4-a716-446655440001",
                                centerId:
                                  "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                                name: "Racket Rental",
                                type: "EQUIPMENT_RENTAL",
                                price: 25000,
                                unit: "VND / 3h",
                                imageUrl:
                                  "https://cdn.example.com/services/racket-rental.png",
                                isActive: true,
                              },
                            ],
                            products: [
                              {
                                id: "550e8400-e29b-41d4-a716-446655440010",
                                centerId:
                                  "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                                name: "Pocari Sweat 500ml",
                                type: "BEVERAGE",
                                price: 25000,
                                unit: "VND / bottle",
                                imageUrl:
                                  "https://cdn.example.com/products/pocari.png",
                                stock: 100,
                                isActive: true,
                              },
                            ],
                            _count: {
                              courts: 8,
                            },
                            averageRating: 4.5,
                            reviewCount: 12,
                            isFavourite: true,
                          },
                        ],
                        pagination: {
                          limit: 20,
                          offset: 0,
                          total: 1,
                        },
                      },
                    },
                  },
                },
              },
            },
            security: [
              {
                "access-token": [],
              },
            ],
            summary: "List sport centers for users",
            tags: ["Sport Centers"],
          },
        },
        "/api/sport-centers/all": {
          get: {
            description: "Returns a list of all sport centers",
            operationId: "CenterController_findAll",
            parameters: [
              {
                name: "limit",
                required: false,
                in: "query",
                description: "Pagination limit",
                schema: {
                  minimum: 1,
                  maximum: 100,
                  default: 20,
                  example: 20,
                  type: "number",
                },
              },
              {
                name: "offset",
                required: false,
                in: "query",
                description: "Pagination offset",
                schema: {
                  minimum: 0,
                  default: 0,
                  example: 0,
                  type: "number",
                },
              },
              {
                name: "status",
                required: false,
                in: "query",
                description: "Filter sport centers by status",
                schema: {
                  example: "ACTIVE",
                  type: "string",
                  enum: ["ACTIVE", "INACTIVE"],
                },
              },
              {
                name: "keyword",
                required: false,
                in: "query",
                description: "Search keyword for center name or address",
                schema: {
                  type: "string",
                },
              },
              {
                name: "favouritesOnly",
                required: false,
                in: "query",
                description:
                  "Return only sport centers favourited by the current user",
                schema: {
                  default: false,
                  type: "boolean",
                },
              },
              {
                name: "latitude",
                required: false,
                in: "query",
                description: "Latitude for proximity sorting",
                schema: {
                  type: "number",
                },
              },
              {
                name: "longitude",
                required: false,
                in: "query",
                description: "Longitude for proximity sorting",
                schema: {
                  type: "number",
                },
              },
            ],
            responses: {
              200: {
                description: "Sport center list fetched successfully.",
                content: {
                  "application/json": {
                    schema: {
                      example: {
                        data: [
                          {
                            id: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                            ownerId: "b7d5a0ea-d859-4b71-aa34-67c2e668f7a4",
                            name: "PickleHub District 1",
                            address:
                              "123 Nguyen Hue, District 1, Ho Chi Minh City",
                            phone: "+84901234567",
                            email: "hello@pickledome.com",
                            openTime: "06:00",
                            closeTime: "22:00",
                            basePrice: 80000,
                            status: "ACTIVE",
                            amenities: ["Parking", "Shower", "Cafe"],
                            images: ["https://example.com/image1.jpg"],
                            rules: [
                              "Please arrive 10 mins early",
                              "Non-marking shoes only",
                            ],
                            description:
                              "Pickle Dome Sukhumvit is a modern pickleball venue...",
                            paymentAccountName: "NGUYEN VAN AN",
                            paymentAccountNumber: "1234567890",
                            paymentBankName: "VietcomBank",
                            paymentQrUrl:
                              "https://cdn.example.com/qr/sample-qr.png",
                            createdAt: "2026-04-04T08:00:00.000Z",
                            updatedAt: "2026-04-04T08:00:00.000Z",
                            deletedAt: null,
                            services: [
                              {
                                id: "550e8400-e29b-41d4-a716-446655440001",
                                centerId:
                                  "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                                name: "Racket Rental",
                                type: "EQUIPMENT_RENTAL",
                                price: 25000,
                                unit: "VND / 3h",
                                imageUrl:
                                  "https://cdn.example.com/services/racket-rental.png",
                                isActive: true,
                              },
                            ],
                            products: [
                              {
                                id: "550e8400-e29b-41d4-a716-446655440010",
                                centerId:
                                  "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                                name: "Pocari Sweat 500ml",
                                type: "BEVERAGE",
                                price: 25000,
                                unit: "VND / bottle",
                                imageUrl:
                                  "https://cdn.example.com/products/pocari.png",
                                stock: 100,
                                isActive: true,
                              },
                            ],
                            _count: {
                              courts: 8,
                            },
                            averageRating: 4.5,
                            reviewCount: 12,
                          },
                        ],
                      },
                    },
                  },
                },
              },
            },
            security: [
              {
                "internal-service-token": [],
              },
            ],
            summary: "List all sport centers",
            tags: ["Sport Centers"],
          },
        },
        "/api/sport-centers/me": {
          get: {
            description: "Returns sport centers owned by a specific user.",
            operationId: "CenterController_findByOwnerId",
            parameters: [],
            responses: {
              200: {
                description: "Sport centers fetched successfully.",
                content: {
                  "application/json": {
                    schema: {
                      example: [
                        {
                          id: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                          ownerId: "b7d5a0ea-d859-4b71-aa34-67c2e668f7a4",
                          name: "PickleHub District 1",
                          address:
                            "123 Nguyen Hue, District 1, Ho Chi Minh City",
                          phone: "+84901234567",
                          email: "hello@pickledome.com",
                          openTime: "06:00",
                          closeTime: "22:00",
                          basePrice: 80000,
                          status: "ACTIVE",
                          amenities: ["Parking", "Shower", "Cafe"],
                          images: ["https://example.com/image1.jpg"],
                          rules: [
                            "Please arrive 10 mins early",
                            "Non-marking shoes only",
                          ],
                          description:
                            "Pickle Dome Sukhumvit is a modern pickleball venue...",
                          paymentAccountName: "NGUYEN VAN AN",
                          paymentAccountNumber: "1234567890",
                          paymentBankName: "VietcomBank",
                          paymentQrUrl:
                            "https://cdn.example.com/qr/sample-qr.png",
                          createdAt: "2026-04-04T08:00:00.000Z",
                          updatedAt: "2026-04-04T08:00:00.000Z",
                          deletedAt: null,
                          services: [
                            {
                              id: "550e8400-e29b-41d4-a716-446655440001",
                              centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                              name: "Racket Rental",
                              type: "EQUIPMENT_RENTAL",
                              price: 25000,
                              unit: "VND / 3h",
                              imageUrl:
                                "https://cdn.example.com/services/racket-rental.png",
                              isActive: true,
                              createdAt: "2026-05-20T10:00:00.000Z",
                              updatedAt: "2026-05-20T10:00:00.000Z",
                            },
                          ],
                          products: [
                            {
                              id: "550e8400-e29b-41d4-a716-446655440010",
                              centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                              name: "Pocari Sweat 500ml",
                              description: "Refreshing sports drink",
                              type: "BEVERAGE",
                              price: 25000,
                              unit: "VND / bottle",
                              imageUrl:
                                "https://cdn.example.com/products/pocari.png",
                              stock: 100,
                              isActive: true,
                              createdAt: "2026-05-20T10:00:00.000Z",
                              updatedAt: "2026-05-20T10:00:00.000Z",
                            },
                          ],
                          _count: {
                            courts: 8,
                          },
                          averageRating: 4.5,
                          reviewCount: 12,
                          isFavourite: false,
                        },
                      ],
                    },
                  },
                },
              },
            },
            security: [
              {
                "access-token": [],
              },
            ],
            summary: "List sport centers by owner",
            tags: ["Sport Centers"],
          },
        },
        "/api/sport-centers/{centerId}": {
          get: {
            description: "Returns details of a sport center by centerId.",
            operationId: "CenterController_findOne",
            parameters: [
              {
                name: "centerId",
                required: true,
                in: "path",
                schema: {
                  type: "string",
                },
              },
            ],
            responses: {
              200: {
                description: "Sport center detail fetched successfully.",
                content: {
                  "application/json": {
                    schema: {
                      example: {
                        id: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                        ownerId: "b7d5a0ea-d859-4b71-aa34-67c2e668f7a4",
                        name: "PickleHub District 1",
                        address: "123 Nguyen Hue, District 1, Ho Chi Minh City",
                        phone: "+84901234567",
                        email: "hello@pickledome.com",
                        openTime: "06:00",
                        closeTime: "22:00",
                        basePrice: 80000,
                        status: "ACTIVE",
                        amenities: ["Parking", "Shower", "Cafe"],
                        images: ["https://example.com/image1.jpg"],
                        rules: [
                          "Please arrive 10 mins early",
                          "Non-marking shoes only",
                        ],
                        description:
                          "Pickle Dome Sukhumvit is a modern pickleball venue...",
                        paymentAccountName: "NGUYEN VAN AN",
                        paymentAccountNumber: "1234567890",
                        paymentBankName: "VietcomBank",
                        paymentQrUrl:
                          "https://cdn.example.com/qr/sample-qr.png",
                        createdAt: "2026-04-04T08:00:00.000Z",
                        updatedAt: "2026-04-04T08:00:00.000Z",
                        deletedAt: null,
                        priceSlots: [
                          {
                            id: "b7d5a0ea-d859-4b71-aa34-67c2e668f7a4",
                            centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                            startTime: "06:00",
                            endTime: "12:00",
                            pricePerHour: 80000,
                            createdAt: "2026-05-06T08:00:00.000Z",
                            updatedAt: "2026-05-06T08:00:00.000Z",
                          },
                        ],
                        services: [
                          {
                            id: "550e8400-e29b-41d4-a716-446655440001",
                            centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                            name: "Racket Rental",
                            description:
                              "Rent a professional pickleball racket",
                            type: "EQUIPMENT_RENTAL",
                            price: 25000,
                            unit: "VND / 3h",
                            isActive: true,
                            createdAt: "2026-05-20T10:00:00.000Z",
                            updatedAt: "2026-05-20T10:00:00.000Z",
                          },
                          {
                            id: "550e8400-e29b-41d4-a716-446655440002",
                            centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                            name: "Pro Coaching Session",
                            description:
                              "30-minute coaching session with a pro",
                            type: "COACHING",
                            price: 150000,
                            unit: "VND / session",
                            isActive: true,
                            createdAt: "2026-05-20T10:00:00.000Z",
                            updatedAt: "2026-05-20T10:00:00.000Z",
                          },
                        ],
                        products: [
                          {
                            id: "550e8400-e29b-41d4-a716-446655440010",
                            centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                            name: "Pocari Sweat 500ml",
                            description: "Refreshing sports drink",
                            type: "BEVERAGE",
                            price: 25000,
                            unit: "VND / bottle",
                            stock: 100,
                            isActive: true,
                            createdAt: "2026-05-20T10:00:00.000Z",
                            updatedAt: "2026-05-20T10:00:00.000Z",
                          },
                          {
                            id: "550e8400-e29b-41d4-a716-446655440011",
                            centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                            name: "Rivive Drink 500ml",
                            description: "Energy drink for athletes",
                            type: "BEVERAGE",
                            price: 15000,
                            unit: "VND / bottle",
                            stock: 50,
                            isActive: true,
                            createdAt: "2026-05-20T10:00:00.000Z",
                            updatedAt: "2026-05-20T10:00:00.000Z",
                          },
                        ],
                        _count: {
                          courts: 8,
                        },
                        averageRating: 4.5,
                        reviewCount: 12,
                        isFavourite: true,
                      },
                    },
                  },
                },
              },
              404: {
                description: "Sport center not found.",
              },
            },
            security: [
              {
                "access-token": [],
              },
            ],
            summary: "Get sport center detail",
            tags: ["Sport Centers"],
          },
          patch: {
            description: "Partially updates a sport center by centerId.",
            operationId: "CenterController_update",
            parameters: [
              {
                name: "centerId",
                required: true,
                in: "path",
                schema: {
                  type: "string",
                },
              },
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/UpdateCenterDto",
                  },
                },
              },
            },
            responses: {
              200: {
                description: "Sport center updated successfully.",
                content: {
                  "application/json": {
                    schema: {
                      example: {
                        id: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                        ownerId: "b7d5a0ea-d859-4b71-aa34-67c2e668f7a4",
                        name: "PickleHub District 1",
                        address: "123 Nguyen Hue, District 1, Ho Chi Minh City",
                        phone: "+84901234567",
                        email: "hello@pickledome.com",
                        openTime: "06:00",
                        closeTime: "22:00",
                        basePrice: 80000,
                        status: "ACTIVE",
                        amenities: ["Parking", "Shower", "Cafe"],
                        images: ["https://example.com/image1.jpg"],
                        rules: [
                          "Please arrive 10 mins early",
                          "Non-marking shoes only",
                        ],
                        description:
                          "Pickle Dome Sukhumvit is a modern pickleball venue...",
                        paymentAccountName: "NGUYEN VAN AN",
                        paymentAccountNumber: "1234567890",
                        paymentBankName: "VietcomBank",
                        paymentQrUrl:
                          "https://cdn.example.com/qr/sample-qr.png",
                        createdAt: "2026-04-04T08:00:00.000Z",
                        updatedAt: "2026-05-20T10:00:00.000Z",
                        deletedAt: null,
                      },
                    },
                  },
                },
              },
              400: {
                description: "Invalid payload.",
              },
              404: {
                description: "Sport center not found.",
              },
            },
            security: [
              {
                "access-token": [],
              },
            ],
            summary: "Update sport center",
            tags: ["Sport Centers"],
          },
          delete: {
            description: "Soft deletes a sport center by centerId.",
            operationId: "CenterController_remove",
            parameters: [
              {
                name: "centerId",
                required: true,
                in: "path",
                schema: {
                  type: "string",
                },
              },
            ],
            responses: {
              200: {
                description: "Sport center deleted successfully.",
                content: {
                  "application/json": {
                    schema: {
                      example: {
                        id: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                        ownerId: "b7d5a0ea-d859-4b71-aa34-67c2e668f7a4",
                        name: "PickleHub District 1",
                        address: "123 Nguyen Hue, District 1, Ho Chi Minh City",
                        phone: "+84901234567",
                        email: "hello@pickledome.com",
                        openTime: "06:00",
                        closeTime: "22:00",
                        basePrice: 80000,
                        status: "ACTIVE",
                        amenities: ["Parking", "Shower", "Cafe"],
                        images: ["https://example.com/image1.jpg"],
                        rules: [
                          "Please arrive 10 mins early",
                          "Non-marking shoes only",
                        ],
                        description:
                          "Pickle Dome Sukhumvit is a modern pickleball venue...",
                        paymentAccountName: "NGUYEN VAN AN",
                        paymentAccountNumber: "1234567890",
                        paymentBankName: "VietcomBank",
                        paymentQrUrl:
                          "https://cdn.example.com/qr/sample-qr.png",
                        createdAt: "2026-04-04T08:00:00.000Z",
                        updatedAt: "2026-05-20T10:05:00.000Z",
                        deletedAt: "2026-05-20T10:05:00.000Z",
                      },
                    },
                  },
                },
              },
              400: {
                description: "Invalid payload.",
              },
              404: {
                description: "Sport center not found.",
              },
            },
            security: [
              {
                "access-token": [],
              },
            ],
            summary: "Delete sport center",
            tags: ["Sport Centers"],
          },
        },
        "/api/sport-centers/{centerId}/price-slots": {
          post: {
            description: "Adds a price slot for a specific center.",
            operationId: "CenterController_createPriceSlot",
            parameters: [
              {
                name: "centerId",
                required: true,
                in: "path",
                schema: {
                  type: "string",
                },
              },
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/CreateCenterPriceSlotDto",
                  },
                },
              },
            },
            responses: {
              201: {
                description: "Price slot created successfully.",
                content: {
                  "application/json": {
                    schema: {
                      example: {
                        id: "b7e6b1fb-e960-5c82-bb45-78d3f779g8b5",
                        centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                        startTime: "06:00",
                        endTime: "12:00",
                        pricePerHour: 80000,
                        createdAt: "2026-05-06T08:00:00.000Z",
                        updatedAt: "2026-05-20T10:00:00.000Z",
                      },
                    },
                  },
                },
              },
              404: {
                description: "Center not found.",
              },
            },
            security: [
              {
                "access-token": [],
              },
            ],
            summary: "Add a price slot",
            tags: ["Sport Centers"],
          },
          get: {
            description: "Returns all price slots for a specific center.",
            operationId: "CenterController_getPriceSlots",
            parameters: [
              {
                name: "centerId",
                required: true,
                in: "path",
                schema: {
                  type: "string",
                },
              },
            ],
            responses: {
              200: {
                description: "Price slots fetched successfully.",
                content: {
                  "application/json": {
                    schema: {
                      example: [
                        {
                          id: "b7d5a0ea-d859-4b71-aa34-67c2e668f7a4",
                          centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                          startTime: "06:00",
                          endTime: "12:00",
                          pricePerHour: 80000,
                          createdAt: "2026-05-06T08:00:00.000Z",
                          updatedAt: "2026-05-06T08:00:00.000Z",
                        },
                        {
                          id: "c8e6b1fb-e960-5c82-bb45-78d3f779g8b5",
                          centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                          startTime: "12:00",
                          endTime: "18:00",
                          pricePerHour: 120000,
                          createdAt: "2026-05-06T08:00:00.000Z",
                          updatedAt: "2026-05-06T08:00:00.000Z",
                        },
                      ],
                    },
                  },
                },
              },
            },
            security: [
              {
                "access-token": [],
              },
            ],
            summary: "Get price slots",
            tags: ["Sport Centers"],
          },
          patch: {
            description: "Replaces all price slots for a specific center.",
            operationId: "CenterController_updatePriceSlots",
            parameters: [
              {
                name: "centerId",
                required: true,
                in: "path",
                schema: {
                  type: "string",
                },
              },
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/UpdateCenterPriceSlotsDto",
                  },
                },
              },
            },
            responses: {
              200: {
                description: "Price slots updated successfully.",
              },
              404: {
                description: "Center not found.",
              },
            },
            security: [
              {
                "access-token": [],
              },
            ],
            summary: "Update price slots in bulk",
            tags: ["Sport Centers"],
          },
        },
        "/api/sport-centers/{centerId}/price-slots/{slotId}": {
          delete: {
            description: "Deletes a price slot for a specific center.",
            operationId: "CenterController_deletePriceSlot",
            parameters: [
              {
                name: "centerId",
                required: true,
                in: "path",
                schema: {
                  type: "string",
                },
              },
              {
                name: "slotId",
                required: true,
                in: "path",
                schema: {
                  type: "string",
                },
              },
            ],
            responses: {
              200: {
                description: "Price slot deleted successfully.",
                content: {
                  "application/json": {
                    schema: {
                      example: {
                        id: "b7e6b1fb-e960-5c82-bb45-78d3f779g8b5",
                        centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                        startTime: "06:00",
                        endTime: "12:00",
                        pricePerHour: 80000,
                        createdAt: "2026-05-06T08:00:00.000Z",
                        updatedAt: "2026-05-20T10:00:00.000Z",
                      },
                    },
                  },
                },
              },
              404: {
                description: "Price slot not found.",
              },
            },
            security: [
              {
                "access-token": [],
              },
            ],
            summary: "Delete a price slot",
            tags: ["Sport Centers"],
          },
        },
        "/api/sport-centers/{centerId}/cancellation-policy": {
          get: {
            description:
              "Returns the preservation credit cancellation policy for a sport center: whether player-initiated cancellations are allowed and the refund tiers.",
            operationId: "CenterController_getCancellationPolicy",
            parameters: [
              {
                name: "centerId",
                required: true,
                in: "path",
                schema: {
                  type: "string",
                },
              },
            ],
            responses: {
              200: {
                description: "Cancellation policy fetched successfully.",
                content: {
                  "application/json": {
                    schema: {
                      example: {
                        centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                        allowCancellation: true,
                        tiers: [
                          {
                            id: "uuid-1",
                            centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                            minDaysBeforeStart: 2,
                            refundPercent: 100,
                          },
                          {
                            id: "uuid-2",
                            centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                            minDaysBeforeStart: 1,
                            refundPercent: 75,
                          },
                        ],
                      },
                    },
                  },
                },
              },
              404: {
                description: "Sport center not found.",
              },
            },
            security: [
              {
                "access-token": [],
              },
            ],
            summary: "Get cancellation policy",
            tags: ["Sport Centers"],
          },
          patch: {
            description:
              "Replaces the cancellation policy for a sport center. Only the owning user may update this. Tiers are fully replaced when provided — pass an empty array to clear all tiers. Example: [{ minDaysBeforeStart: 2, refundPercent: 100 }, { minDaysBeforeStart: 1, refundPercent: 75 }] means: cancel >=2 days ahead -> 100% credit; cancel >=1 day ahead -> 75%; cancel <1 day -> 0%.",
            operationId: "CenterController_updateCancellationPolicy",
            parameters: [
              {
                name: "centerId",
                required: true,
                in: "path",
                schema: {
                  type: "string",
                },
              },
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/UpdateCancellationPolicyDto",
                  },
                },
              },
            },
            responses: {
              200: {
                description: "Cancellation policy updated successfully.",
                content: {
                  "application/json": {
                    schema: {
                      example: {
                        id: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                        allowCancellation: true,
                        cancellationTiers: [
                          {
                            id: "uuid-1",
                            centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                            minDaysBeforeStart: 2,
                            refundPercent: 100,
                          },
                          {
                            id: "uuid-2",
                            centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                            minDaysBeforeStart: 1,
                            refundPercent: 75,
                          },
                        ],
                      },
                    },
                  },
                },
              },
              403: {
                description: "Caller is not the owner.",
              },
              404: {
                description: "Sport center not found.",
              },
            },
            security: [
              {
                "access-token": [],
              },
            ],
            summary: "Update cancellation policy (owner action)",
            tags: ["Sport Centers"],
          },
        },
        "/api/sport-centers/{centerId}/credits": {
          get: {
            description:
              "Returns all preservation credit wallets held by players at this sport center. Also returns `totalOutstandingCredit` — the sum of all balances, which represents the total credit liability the center owes to players.",
            operationId: "CenterController_getCenterCreditWallets",
            parameters: [
              {
                name: "centerId",
                required: true,
                in: "path",
                schema: {
                  type: "string",
                },
              },
              {
                name: "limit",
                required: false,
                in: "query",
                schema: {
                  example: 20,
                  type: "string",
                },
              },
              {
                name: "offset",
                required: false,
                in: "query",
                schema: {
                  example: 0,
                  type: "string",
                },
              },
            ],
            responses: {
              200: {
                description: "Credit wallets listed successfully.",
                content: {
                  "application/json": {
                    schema: {
                      example: {
                        data: [
                          {
                            id: "wallet-uuid-1",
                            playerId: "user-uuid-1234",
                            centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                            balance: 315000,
                            transactions: [
                              {
                                id: "tx-uuid-1",
                                bookingId: "booking-uuid-1",
                                amount: 315000,
                                type: "CANCELLATION_REFUND",
                                description:
                                  "100% preservation credit refund — owner-initiated cancellation",
                                createdAt: "2026-05-22T10:00:00.000Z",
                                booking: {
                                  id: "booking-uuid-1",
                                  date: "2026-05-20T00:00:00.000Z",
                                  startTime: "17:00",
                                  endTime: "19:00",
                                  status: "CANCELLED",
                                  totalPrice: 315000,
                                  creditApplied: 0,
                                  paymentRemaining: 0,
                                  center: {
                                    id: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                                    name: "Pickle Dome Sukhumvit",
                                  },
                                  bookingItems: [
                                    {
                                      startTime: "17:00",
                                      endTime: "18:00",
                                      itemPrice: 157500,
                                      court: {
                                        id: "court-uuid-1",
                                        name: "Court 1",
                                      },
                                    },
                                    {
                                      startTime: "18:00",
                                      endTime: "19:00",
                                      itemPrice: 157500,
                                      court: {
                                        id: "court-uuid-1",
                                        name: "Court 1",
                                      },
                                    },
                                  ],
                                },
                              },
                            ],
                            updatedAt: "2026-05-22T10:00:00.000Z",
                          },
                          {
                            id: "wallet-uuid-2",
                            playerId: "user-uuid-5678",
                            centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                            balance: 120000,
                            transactions: [
                              {
                                id: "tx-uuid-2",
                                bookingId: "booking-uuid-2",
                                amount: -120000,
                                type: "BOOKING_PAYMENT",
                                description:
                                  "Preservation credit applied to booking",
                                createdAt: "2026-05-21T08:00:00.000Z",
                                booking: {
                                  id: "booking-uuid-2",
                                  date: "2026-05-21T00:00:00.000Z",
                                  startTime: "08:00",
                                  endTime: "10:00",
                                  status: "PENDING",
                                  totalPrice: 320000,
                                  creditApplied: 120000,
                                  paymentRemaining: 200000,
                                  center: {
                                    id: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                                    name: "Pickle Dome Sukhumvit",
                                  },
                                  bookingItems: [
                                    {
                                      startTime: "08:00",
                                      endTime: "09:00",
                                      itemPrice: 160000,
                                      court: {
                                        id: "court-uuid-2",
                                        name: "Court 2",
                                      },
                                    },
                                    {
                                      startTime: "09:00",
                                      endTime: "10:00",
                                      itemPrice: 160000,
                                      court: {
                                        id: "court-uuid-2",
                                        name: "Court 2",
                                      },
                                    },
                                  ],
                                },
                              },
                            ],
                            updatedAt: "2026-05-21T08:00:00.000Z",
                          },
                        ],
                        totalOutstandingCredit: 435000,
                        pagination: {
                          limit: 20,
                          offset: 0,
                          total: 2,
                        },
                      },
                    },
                  },
                },
              },
              403: {
                description: "Caller is not the owner.",
              },
              404: {
                description: "Sport center not found.",
              },
            },
            security: [
              {
                "access-token": [],
              },
            ],
            summary: "List player credit wallets (owner)",
            tags: ["Sport Centers"],
          },
        },
        "/api/sport-centers/{centerId}/credits/{playerId}/transactions": {
          get: {
            description:
              "Returns the full preservation credit transaction history for a specific player at this center. Useful for owner support and dispute resolution.",
            operationId: "CenterController_getPlayerCreditTransactions",
            parameters: [
              {
                name: "centerId",
                required: true,
                in: "path",
                schema: {
                  type: "string",
                },
              },
              {
                name: "playerId",
                required: true,
                in: "path",
                schema: {
                  type: "string",
                },
              },
              {
                name: "limit",
                required: false,
                in: "query",
                schema: {
                  example: 20,
                  type: "string",
                },
              },
              {
                name: "offset",
                required: false,
                in: "query",
                schema: {
                  example: 0,
                  type: "string",
                },
              },
            ],
            responses: {
              200: {
                description: "Transaction history fetched successfully.",
                content: {
                  "application/json": {
                    schema: {
                      example: {
                        centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                        centerName: "Pickle Dome Sukhumvit",
                        playerId: "user-uuid-1234",
                        balance: 315000,
                        transactions: [
                          {
                            id: "tx-uuid-1",
                            bookingId: "booking-uuid-1",
                            amount: 315000,
                            type: "CANCELLATION_REFUND",
                            description:
                              "100% preservation credit refund — owner-initiated cancellation",
                            createdAt: "2026-05-22T10:00:00.000Z",
                            booking: {
                              id: "booking-uuid-1",
                              date: "2026-05-20T00:00:00.000Z",
                              startTime: "17:00",
                              endTime: "19:00",
                              status: "CANCELLED",
                              totalPrice: 315000,
                              creditApplied: 0,
                              paymentRemaining: 0,
                              center: {
                                id: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                                name: "Pickle Dome Sukhumvit",
                              },
                              bookingItems: [
                                {
                                  startTime: "17:00",
                                  endTime: "18:00",
                                  itemPrice: 157500,
                                  court: {
                                    id: "court-uuid-1",
                                    name: "Court 1",
                                  },
                                },
                                {
                                  startTime: "18:00",
                                  endTime: "19:00",
                                  itemPrice: 157500,
                                  court: {
                                    id: "court-uuid-1",
                                    name: "Court 1",
                                  },
                                },
                              ],
                            },
                          },
                        ],
                      },
                    },
                  },
                },
              },
              403: {
                description: "Caller is not the owner.",
              },
              404: {
                description: "Sport center not found.",
              },
            },
            security: [
              {
                "access-token": [],
              },
            ],
            summary: "Get player credit transaction history (owner)",
            tags: ["Sport Centers"],
          },
        },
        "/api/sport-centers/owner/dashboard/overview": {
          get: {
            description:
              "Returns aggregated statistics across all sport centers owned by the current user.",
            operationId: "DashboardController_getOverview",
            parameters: [],
            responses: {
              200: {
                description: "Dashboard overview fetched successfully.",
                content: {
                  "application/json": {
                    schema: {
                      example: {
                        facility: {
                          totalCenters: 2,
                          totalCourts: 12,
                        },
                        customers: {
                          totalUniqueCustomers: 342,
                          globalAverageRating: 4.8,
                          totalReviews: 156,
                        },
                        bookings: {
                          total: 1250,
                          pending: 15,
                          confirmed: 42,
                          completed: 1150,
                          cancelled: 43,
                        },
                        revenue: {
                          settled: 12500000,
                          pending: 315000,
                        },
                      },
                    },
                  },
                },
              },
            },
            security: [
              {
                "access-token": [],
              },
            ],
            summary: "Get owner dashboard overview",
            tags: ["Owner Dashboard"],
          },
        },
        "/api/sport-centers/owner/dashboard/overview/{centerId}": {
          get: {
            description:
              "Returns aggregated statistics for a specific sport center owned by the current user.",
            operationId: "DashboardController_getCenterOverview",
            parameters: [
              {
                name: "centerId",
                required: true,
                in: "path",
                schema: {
                  type: "string",
                },
              },
            ],
            responses: {
              200: {
                description: "Dashboard overview fetched successfully.",
                content: {
                  "application/json": {
                    schema: {
                      example: {
                        facility: {
                          totalCenters: 1,
                          totalCourts: 6,
                        },
                        customers: {
                          totalUniqueCustomers: 342,
                          globalAverageRating: 4.8,
                          totalReviews: 156,
                        },
                        bookings: {
                          total: 1250,
                          pending: 15,
                          confirmed: 42,
                          completed: 1150,
                          cancelled: 43,
                        },
                        revenue: {
                          settled: 12500000,
                          pending: 315000,
                        },
                      },
                    },
                  },
                },
              },
              403: {
                description: "User does not own this sport center.",
              },
              404: {
                description: "Sport center not found.",
              },
            },
            security: [
              {
                "access-token": [],
              },
            ],
            summary: "Get specific sport center dashboard overview",
            tags: ["Owner Dashboard"],
          },
        },
        "/api/sport-centers/{centerId}/courts": {
          post: {
            description: "Creates a child court under the given sport center.",
            operationId: "CourtController_create",
            parameters: [
              {
                name: "centerId",
                required: true,
                in: "path",
                schema: {
                  type: "string",
                },
              },
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/CreateCourtDto",
                  },
                },
              },
            },
            responses: {
              201: {
                description: "Court created successfully.",
                content: {
                  "application/json": {
                    schema: {
                      example: {
                        id: "e3bc6784-b972-4e92-9b01-f21ddb56dd63",
                        centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                        name: "San 1",
                        type: "INDOOR",
                        status: "ACTIVE",
                        createdAt: "2026-04-04T08:00:00.000Z",
                        updatedAt: "2026-04-04T08:00:00.000Z",
                      },
                    },
                  },
                },
              },
              400: {
                description: "Invalid payload.",
              },
              403: {
                description: "Caller is not the owner of the sport center.",
              },
              404: {
                description: "Sport center not found.",
              },
            },
            security: [
              {
                "access-token": [],
              },
            ],
            summary: "Create court in sport center",
            tags: ["Courts"],
          },
          get: {
            description:
              "Returns all courts belonging to the given sport center.",
            operationId: "CourtController_findAllByCenter",
            parameters: [
              {
                name: "centerId",
                required: true,
                in: "path",
                schema: {
                  type: "string",
                },
              },
            ],
            responses: {
              200: {
                description: "Court list fetched successfully.",
                content: {
                  "application/json": {
                    schema: {
                      example: [
                        {
                          id: "e3bc6784-b972-4e92-9b01-f21ddb56dd63",
                          centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                          name: "San 1",
                          type: "INDOOR",
                          status: "ACTIVE",
                          createdAt: "2026-04-04T08:00:00.000Z",
                          updatedAt: "2026-04-04T08:00:00.000Z",
                        },
                      ],
                    },
                  },
                },
              },
              404: {
                description: "Sport center not found.",
              },
            },
            security: [
              {
                "access-token": [],
              },
            ],
            summary: "List courts by sport center",
            tags: ["Courts"],
          },
        },
        "/api/sport-centers/{centerId}/courts/{courtId}": {
          patch: {
            description:
              "Partially updates a court under the given sport center.",
            operationId: "CourtController_update",
            parameters: [
              {
                name: "centerId",
                required: true,
                in: "path",
                schema: {
                  type: "string",
                },
              },
              {
                name: "courtId",
                required: true,
                in: "path",
                schema: {
                  type: "string",
                },
              },
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/UpdateCourtDto",
                  },
                },
              },
            },
            responses: {
              200: {
                description: "Court updated successfully.",
              },
              400: {
                description: "Invalid payload.",
              },
              403: {
                description: "Caller is not the owner of the sport center.",
              },
              404: {
                description: "Sport center or court not found.",
              },
            },
            security: [
              {
                "access-token": [],
              },
            ],
            summary: "Update court",
            tags: ["Courts"],
          },
          delete: {
            description:
              "Soft-deletes a court by transitioning status to ARCHIVED.",
            operationId: "CourtController_archive",
            parameters: [
              {
                name: "centerId",
                required: true,
                in: "path",
                schema: {
                  type: "string",
                },
              },
              {
                name: "courtId",
                required: true,
                in: "path",
                schema: {
                  type: "string",
                },
              },
            ],
            responses: {
              200: {
                description: "Court archived successfully.",
                content: {
                  "application/json": {
                    schema: {
                      example: {
                        id: "e3bc6784-b972-4e92-9b01-f21ddb56dd63",
                        centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                        name: "San 1",
                        type: "INDOOR",
                        status: "ARCHIVED",
                        createdAt: "2026-04-04T08:00:00.000Z",
                        updatedAt: "2026-04-04T08:15:00.000Z",
                      },
                    },
                  },
                },
              },
              403: {
                description: "Caller is not the owner of the sport center.",
              },
              404: {
                description: "Sport center or court not found.",
              },
            },
            security: [
              {
                "access-token": [],
              },
            ],
            summary: "Archive court",
            tags: ["Courts"],
          },
        },
        "/api/sport-centers/internal/courts/batch": {
          post: {
            operationId: "CourtInternalController_getBatchCourts",
            parameters: [],
            responses: {
              201: {
                description: "",
              },
            },
            security: [
              {
                "internal-service-token": [],
              },
            ],
            tags: ["internal"],
          },
        },
        "/api/sport-centers/internal/centers/batch": {
          post: {
            operationId: "CourtInternalController_getBatchCenters",
            parameters: [],
            responses: {
              201: {
                description: "",
              },
            },
            security: [
              {
                "internal-service-token": [],
              },
            ],
            tags: ["internal"],
          },
        },
        "/api/sport-centers/internal/favourites/user": {
          post: {
            operationId: "CourtInternalController_getUserFavourites",
            parameters: [],
            responses: {
              201: {
                description: "",
              },
            },
            security: [
              {
                "internal-service-token": [],
              },
            ],
            tags: ["internal"],
          },
        },
        "/api/sport-centers/{centerId}/courts/{courtId}/availability": {
          get: {
            operationId: "BookingController_getAvailability",
            parameters: [
              {
                name: "centerId",
                required: true,
                in: "path",
                schema: {
                  type: "string",
                },
              },
              {
                name: "courtId",
                required: true,
                in: "path",
                schema: {
                  type: "string",
                },
              },
              {
                name: "date",
                required: true,
                in: "query",
                description: "Date to check availability in YYYY-MM-DD format",
                schema: {
                  example: "2026-05-15",
                  type: "string",
                },
              },
            ],
            responses: {
              200: {
                description: "Availability fetched successfully.",
                content: {
                  "application/json": {
                    schema: {
                      example: {
                        date: "2026-05-15",
                        courtId: "f21ddb56-dd63-4e92-9b01-e3bc6784b972",
                        centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                        slots: [
                          {
                            startTime: "06:00",
                            endTime: "06:30",
                            available: true,
                            pricePerHour: 80000,
                          },
                          {
                            startTime: "06:30",
                            endTime: "07:00",
                            available: false,
                            pricePerHour: 80000,
                          },
                        ],
                      },
                    },
                  },
                },
              },
            },
            security: [
              {
                "access-token": [],
              },
            ],
            summary: "Get court availability",
            tags: ["Bookings"],
          },
        },
        "/api/sport-centers/{centerId}/availability": {
          get: {
            description:
              "Returns 30-minute availability slots for ALL active courts in the center for a given date. Use this instead of calling the per-court availability endpoint N times.",
            operationId: "BookingController_getBulkAvailability",
            parameters: [
              {
                name: "centerId",
                required: true,
                in: "path",
                schema: {
                  type: "string",
                },
              },
              {
                name: "date",
                required: true,
                in: "query",
                description: "Date to check availability in YYYY-MM-DD format",
                schema: {
                  example: "2026-05-15",
                  type: "string",
                },
              },
            ],
            responses: {
              200: {
                description: "Bulk availability fetched successfully.",
                content: {
                  "application/json": {
                    schema: {
                      example: {
                        date: "2026-05-15",
                        centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                        courtCount: 8,
                        courts: [
                          {
                            courtId: "f21ddb56-dd63-4e92-9b01-e3bc6784b972",
                            courtName: "Sân 1",
                            slots: [
                              {
                                startTime: "06:00",
                                endTime: "06:30",
                                available: true,
                                pricePerHour: 80000,
                              },
                              {
                                startTime: "06:30",
                                endTime: "07:00",
                                available: false,
                                pricePerHour: 80000,
                              },
                              {
                                startTime: "07:00",
                                endTime: "07:30",
                                available: true,
                                pricePerHour: 80000,
                              },
                            ],
                          },
                          {
                            courtId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                            courtName: "Sân 2",
                            slots: [
                              {
                                startTime: "06:00",
                                endTime: "06:30",
                                available: true,
                                pricePerHour: 80000,
                              },
                              {
                                startTime: "06:30",
                                endTime: "07:00",
                                available: true,
                                pricePerHour: 80000,
                              },
                              {
                                startTime: "07:00",
                                endTime: "07:30",
                                available: false,
                                pricePerHour: 80000,
                              },
                            ],
                          },
                        ],
                      },
                    },
                  },
                },
              },
              404: {
                description: "Sport center not found or not active.",
              },
            },
            security: [
              {
                "access-token": [],
              },
            ],
            summary: "Get bulk court availability",
            tags: ["Bookings"],
          },
        },
        "/api/sport-centers/{centerId}/bookings/preview": {
          post: {
            description:
              "Calculates the total price for one or more court-time selections without creating bookings. This endpoint is preview-only and does not create any booking. POST is used to avoid URL-size limits when sending line items.",
            operationId: "BookingController_previewBooking",
            parameters: [
              {
                name: "centerId",
                required: true,
                in: "path",
                schema: {
                  type: "string",
                },
              },
            ],
            requestBody: {
              required: true,
              description:
                "Preview booking payload. The request is used for price calculation only and does not create a booking.",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/PreviewBookingDto",
                  },
                },
              },
            },
            responses: {
              200: {
                description: "Price preview calculated successfully.",
                content: {
                  "application/json": {
                    schema: {
                      example: {
                        centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                        date: "2026-05-15",
                        bookingCount: 2,
                        items: [
                          {
                            courtId: "f21ddb56-dd63-4e92-9b01-e3bc6784b972",
                            courtName: "San 1",
                            startTime: "17:00",
                            endTime: "19:00",
                            durationHours: 2,
                            breakdown: [
                              {
                                startTime: "17:00",
                                endTime: "17:30",
                                pricePerHour: 120000,
                              },
                              {
                                startTime: "17:30",
                                endTime: "18:00",
                                pricePerHour: 120000,
                              },
                              {
                                startTime: "18:00",
                                endTime: "18:30",
                                pricePerHour: 120000,
                              },
                              {
                                startTime: "18:30",
                                endTime: "19:00",
                                pricePerHour: 120000,
                              },
                            ],
                            courtPrice: 240000,
                          },
                          {
                            courtId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                            courtName: "San 2",
                            startTime: "19:00",
                            endTime: "21:00",
                            durationHours: 2,
                            breakdown: [
                              {
                                startTime: "19:00",
                                endTime: "19:30",
                                pricePerHour: 120000,
                              },
                              {
                                startTime: "19:30",
                                endTime: "20:00",
                                pricePerHour: 120000,
                              },
                              {
                                startTime: "20:00",
                                endTime: "20:30",
                                pricePerHour: 120000,
                              },
                              {
                                startTime: "20:30",
                                endTime: "21:00",
                                pricePerHour: 120000,
                              },
                            ],
                            courtPrice: 240000,
                          },
                        ],
                        totalCourtPrice: 480000,
                        services: [
                          {
                            id: "550e8400-e29b-41d4-a716-446655440001",
                            name: "Racket Rental",
                            price: 25000,
                            unit: "VND / 3h",
                            quantity: 1,
                            lineTotal: 25000,
                          },
                        ],
                        servicePrice: 25000,
                        products: [
                          {
                            id: "550e8400-e29b-41d4-a716-446655440010",
                            name: "Pocari Sweat 500ml",
                            price: 25000,
                            unit: "VND / bottle",
                            stock: 100,
                            quantity: 2,
                            lineTotal: 50000,
                          },
                        ],
                        productPrice: 50000,
                        totalPrice: 555000,
                      },
                    },
                  },
                },
              },
              400: {
                description: "Invalid time range or outside operating hours.",
              },
              404: {
                description: "Court not found or inactive.",
              },
            },
            security: [
              {
                "access-token": [],
              },
            ],
            summary: "Preview booking price",
            tags: ["Bookings"],
          },
        },
        "/api/sport-centers/{centerId}/bookings": {
          post: {
            description:
              "Creates court bookings (one per date) containing one or more booked court-time items within the selected center. \n\n**Without credit (`useCredit: false` or omitted):** bookings start as PENDING. The response includes center payment info so the player can immediately make a bank transfer. After transferring, upload proof via `PATCH /bookings/:bookingId/payment-proof`.\n\n**With credit (`useCredit: true`):** available preservation credit at this sport center is deducted from `totalPrice`. If credit fully covers the amount (`paymentRemaining === 0`) the bookings are instantly set to **CONFIRMED** — no payment proof required. If credit only partially covers it, the bookings stay PENDING and the player must pay the remaining `paymentRemaining` amount.\n\n**⏱️ Payment timeout:** PENDING bookings are automatically cancelled after **10 minutes** if no payment proof is uploaded. The response includes `expiresAt` (ISO timestamp) and `bookingTimeoutMinutes` — use these to display a countdown timer on the payment screen. Both fields are `null` when the booking is instantly CONFIRMED via full credit.",
            operationId: "BookingController_createBooking",
            parameters: [
              {
                name: "centerId",
                required: true,
                in: "path",
                schema: {
                  type: "string",
                },
              },
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/CreateBookingDto",
                  },
                },
              },
            },
            responses: {
              201: {
                description: "Bookings created successfully.",
                content: {
                  "application/json": {
                    schema: {
                      type: "array",
                      items: {
                        example: {
                          id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                          centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                          playerId: "user-uuid-1234",
                          playerName: "John Doe",
                          phoneNumber: "+66 81 234 5678",
                          date: "2026-05-15T00:00:00.000Z",
                          status: "PENDING",
                          totalPrice: 630000,
                          creditApplied: 120000,
                          paymentRemaining: 510000,
                          note: "Need extra balls",
                          playSessionId: null,
                          paymentProofUrl: null,
                          paymentProofUploadedAt: null,
                          expiresAt: "2026-05-06T08:10:00.000Z",
                          bookingTimeoutMinutes: 10,
                          createdAt: "2026-05-06T08:00:00.000Z",
                          updatedAt: "2026-05-06T08:00:00.000Z",
                          cancelledAt: null,
                          cancelReason: null,
                          center: {
                            id: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                            ownerId: "owner-uuid-5678",
                            name: "Pickle Dome Sukhumvit",
                            address: "42 Sukhumvit 49, Watthana, Bangkok",
                            phone: "+66 2 111 2222",
                            email: "hello@pickledome.com",
                            openTime: "06:00",
                            closeTime: "23:00",
                            basePrice: 80000,
                            status: "ACTIVE",
                            amenities: ["Parking", "Shower"],
                            images: [],
                            rules: ["Non-marking shoes only"],
                            description: "Pickle Dome Sukhumvit",
                            paymentAccountName: "NGUYEN VAN AN",
                            paymentAccountNumber: "1234567890",
                            paymentBankName: "VietcomBank",
                            paymentQrUrl:
                              "https://cdn.example.com/qr/sample-qr.png",
                            createdAt: "2026-05-06T08:00:00.000Z",
                            updatedAt: "2026-05-06T08:00:00.000Z",
                            deletedAt: null,
                          },
                          bookingItems: [
                            {
                              id: "i1111111-2222-3333-4444-555555555551",
                              bookingId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                              courtId: "f21ddb56-dd63-4e92-9b01-e3bc6784b972",
                              startTime: "17:00",
                              endTime: "19:00",
                              itemPrice: 240000,
                              createdAt: "2026-05-06T08:00:00.000Z",
                              court: {
                                id: "f21ddb56-dd63-4e92-9b01-e3bc6784b972",
                                centerId:
                                  "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                                name: "San 1",
                                type: "INDOOR",
                                status: "ACTIVE",
                                createdAt: "2026-05-06T08:00:00.000Z",
                                updatedAt: "2026-05-06T08:00:00.000Z",
                              },
                            },
                            {
                              id: "i1111111-2222-3333-4444-555555555552",
                              bookingId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                              courtId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                              startTime: "19:00",
                              endTime: "21:00",
                              itemPrice: 240000,
                              createdAt: "2026-05-06T08:00:00.000Z",
                              court: {
                                id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                                centerId:
                                  "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                                name: "San 2",
                                type: "INDOOR",
                                status: "ACTIVE",
                                createdAt: "2026-05-06T08:00:00.000Z",
                                updatedAt: "2026-05-06T08:00:00.000Z",
                              },
                            },
                          ],
                          bookingServices: [
                            {
                              id: "c1111111-2222-3333-4444-555555555551",
                              bookingId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                              serviceId: "550e8400-e29b-41d4-a716-446655440001",
                              quantity: 1,
                              price: 25000,
                              createdAt: "2026-05-20T10:00:00.000Z",
                              service: {
                                id: "550e8400-e29b-41d4-a716-446655440001",
                                centerId:
                                  "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                                name: "Racket Rental",
                                description:
                                  "Rent a professional pickleball racket",
                                type: "EQUIPMENT_RENTAL",
                                imageUrl:
                                  "https://cdn.example.com/services/racket-rental.png",
                                price: 25000,
                                unit: "VND / 3h",
                                isActive: true,
                                createdAt: "2026-05-20T10:00:00.000Z",
                                updatedAt: "2026-05-20T10:00:00.000Z",
                              },
                            },
                          ],
                          bookingProducts: [
                            {
                              id: "c1111111-2222-3333-4444-555555555552",
                              bookingId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                              productId: "550e8400-e29b-41d4-a716-446655440010",
                              quantity: 2,
                              price: 25000,
                              createdAt: "2026-05-20T10:00:00.000Z",
                              product: {
                                id: "550e8400-e29b-41d4-a716-446655440010",
                                centerId:
                                  "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                                name: "Pocari Sweat 500ml",
                                description: "Refreshing sports drink",
                                type: "BEVERAGE",
                                imageUrl:
                                  "https://cdn.example.com/products/pocari.png",
                                price: 25000,
                                unit: "VND / bottle",
                                stock: 100,
                                isActive: true,
                                createdAt: "2026-05-20T10:00:00.000Z",
                                updatedAt: "2026-05-20T10:00:00.000Z",
                              },
                            },
                          ],
                          items: [
                            {
                              courtId: "f21ddb56-dd63-4e92-9b01-e3bc6784b972",
                              courtName: "San 1",
                              startTime: "17:00",
                              endTime: "19:00",
                              durationHours: 2,
                              breakdown: [
                                {
                                  startTime: "17:00",
                                  endTime: "17:30",
                                  pricePerHour: 120000,
                                },
                                {
                                  startTime: "17:30",
                                  endTime: "18:00",
                                  pricePerHour: 120000,
                                },
                                {
                                  startTime: "18:00",
                                  endTime: "18:30",
                                  pricePerHour: 120000,
                                },
                                {
                                  startTime: "18:30",
                                  endTime: "19:00",
                                  pricePerHour: 120000,
                                },
                              ],
                              courtPrice: 240000,
                            },
                            {
                              courtId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                              courtName: "San 2",
                              startTime: "19:00",
                              endTime: "21:00",
                              durationHours: 2,
                              breakdown: [
                                {
                                  startTime: "19:00",
                                  endTime: "19:30",
                                  pricePerHour: 120000,
                                },
                                {
                                  startTime: "19:30",
                                  endTime: "20:00",
                                  pricePerHour: 120000,
                                },
                                {
                                  startTime: "20:00",
                                  endTime: "20:30",
                                  pricePerHour: 120000,
                                },
                                {
                                  startTime: "20:30",
                                  endTime: "21:00",
                                  pricePerHour: 120000,
                                },
                              ],
                              courtPrice: 240000,
                            },
                          ],
                          bookingCount: 2,
                          totalCourtPrice: 480000,
                          totalServicePrice: 50000,
                          totalProductPrice: 100000,
                          services: [
                            {
                              id: "550e8400-e29b-41d4-a716-446655440001",
                              name: "Racket Rental",
                              price: 25000,
                              unit: "VND / 3h",
                              quantity: 1,
                              lineTotal: 25000,
                            },
                          ],
                          products: [
                            {
                              id: "550e8400-e29b-41d4-a716-446655440010",
                              name: "Pocari Sweat 500ml",
                              price: 25000,
                              unit: "VND / bottle",
                              stock: 100,
                              quantity: 2,
                              lineTotal: 50000,
                            },
                          ],
                          servicePricePerItem: 25000,
                          productPricePerItem: 50000,
                        },
                      },
                    },
                  },
                },
              },
            },
            security: [
              {
                "access-token": [],
              },
            ],
            summary: "Create one or more court bookings (single or multi-day)",
            tags: ["Bookings"],
          },
          get: {
            description:
              "Owner can list all bookings for their center with pagination and filters.",
            operationId: "BookingController_listCenterBookings",
            parameters: [
              {
                name: "centerId",
                required: true,
                in: "path",
                schema: {
                  type: "string",
                },
              },
              {
                name: "status",
                required: false,
                in: "query",
                schema: {
                  type: "string",
                  enum: ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"],
                },
              },
              {
                name: "courtId",
                required: false,
                in: "query",
                description: "Filter by court ID",
                schema: {
                  type: "string",
                },
              },
              {
                name: "centerId",
                required: false,
                in: "query",
                description: "Filter by sport center ID",
                schema: {
                  type: "string",
                },
              },
              {
                name: "date",
                required: false,
                in: "query",
                description:
                  "@deprecated Kept for old frontend code compatibility. Consider using startDate and endDate for better filtering. If provided, this takes precedence and overrides other date filters.",
                schema: {
                  type: "string",
                },
              },
              {
                name: "startDate",
                required: false,
                in: "query",
                description:
                  "Filter by start date (YYYY-MM-DD). Ignored if `date` is provided.",
                schema: {
                  type: "string",
                },
              },
              {
                name: "endDate",
                required: false,
                in: "query",
                description:
                  "Filter by end date (YYYY-MM-DD). Ignored if `date` is provided.",
                schema: {
                  type: "string",
                },
              },
              {
                name: "timeFilter",
                required: false,
                in: "query",
                description:
                  "Filter by past or future bookings. Can be combined with startDate and endDate. Ignored if `date` is provided.",
                schema: {
                  type: "string",
                  enum: ["PAST", "FUTURE"],
                },
              },
              {
                name: "limit",
                required: false,
                in: "query",
                schema: {
                  default: 20,
                  type: "number",
                },
              },
              {
                name: "offset",
                required: false,
                in: "query",
                schema: {
                  default: 0,
                  type: "number",
                },
              },
            ],
            responses: {
              200: {
                description: "Bookings listed successfully.",
                content: {
                  "application/json": {
                    schema: {
                      example: {
                        data: [
                          {
                            id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                            centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                            playerId: "user-uuid-1234",
                            playerName: "John Doe",
                            phoneNumber: "+66 81 234 5678",
                            date: "2026-05-15T00:00:00.000Z",
                            status: "PENDING",
                            totalPrice: 630000,
                            creditApplied: 0,
                            paymentRemaining: 315000,
                            note: "Need extra balls",
                            playSessionId: null,
                            paymentProofUrl: null,
                            paymentProofUploadedAt: null,
                            expiresAt: "2026-05-06T08:10:00.000Z",
                            bookingTimeoutMinutes: 10,
                            createdAt: "2026-05-06T08:00:00.000Z",
                            updatedAt: "2026-05-06T08:00:00.000Z",
                            cancelledAt: null,
                            cancelReason: null,
                            center: {
                              id: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                              ownerId: "owner-uuid-5678",
                              name: "Pickle Dome Sukhumvit",
                              address: "42 Sukhumvit 49, Watthana, Bangkok",
                              phone: "+66 2 111 2222",
                              email: "hello@pickledome.com",
                              openTime: "06:00",
                              closeTime: "23:00",
                              basePrice: 80000,
                              status: "ACTIVE",
                              amenities: ["Parking", "Shower"],
                              images: [],
                              rules: ["Non-marking shoes only"],
                              description: "Pickle Dome Sukhumvit",
                              paymentAccountName: "NGUYEN VAN AN",
                              paymentAccountNumber: "1234567890",
                              paymentBankName: "VietcomBank",
                              paymentQrUrl:
                                "https://cdn.example.com/qr/sample-qr.png",
                              createdAt: "2026-05-06T08:00:00.000Z",
                              updatedAt: "2026-05-06T08:00:00.000Z",
                              deletedAt: null,
                            },
                            bookingItems: [
                              {
                                id: "i1111111-2222-3333-4444-555555555551",
                                bookingId:
                                  "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                                courtId: "f21ddb56-dd63-4e92-9b01-e3bc6784b972",
                                startTime: "17:00",
                                endTime: "19:00",
                                itemPrice: 240000,
                                createdAt: "2026-05-06T08:00:00.000Z",
                                court: {
                                  id: "f21ddb56-dd63-4e92-9b01-e3bc6784b972",
                                  centerId:
                                    "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                                  name: "San 1",
                                  type: "INDOOR",
                                  status: "ACTIVE",
                                  createdAt: "2026-05-06T08:00:00.000Z",
                                  updatedAt: "2026-05-06T08:00:00.000Z",
                                },
                              },
                              {
                                id: "i1111111-2222-3333-4444-555555555552",
                                bookingId:
                                  "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                                courtId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                                startTime: "19:00",
                                endTime: "21:00",
                                itemPrice: 240000,
                                createdAt: "2026-05-06T08:00:00.000Z",
                                court: {
                                  id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                                  centerId:
                                    "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                                  name: "San 2",
                                  type: "INDOOR",
                                  status: "ACTIVE",
                                  createdAt: "2026-05-06T08:00:00.000Z",
                                  updatedAt: "2026-05-06T08:00:00.000Z",
                                },
                              },
                            ],
                            bookingServices: [
                              {
                                id: "c1111111-2222-3333-4444-555555555551",
                                bookingId:
                                  "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                                serviceId:
                                  "550e8400-e29b-41d4-a716-446655440001",
                                quantity: 1,
                                price: 25000,
                                createdAt: "2026-05-20T10:00:00.000Z",
                                service: {
                                  id: "550e8400-e29b-41d4-a716-446655440001",
                                  centerId:
                                    "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                                  name: "Racket Rental",
                                  description:
                                    "Rent a professional pickleball racket",
                                  type: "EQUIPMENT_RENTAL",
                                  imageUrl:
                                    "https://cdn.example.com/services/racket-rental.png",
                                  price: 25000,
                                  unit: "VND / 3h",
                                  isActive: true,
                                  createdAt: "2026-05-20T10:00:00.000Z",
                                  updatedAt: "2026-05-20T10:00:00.000Z",
                                },
                              },
                            ],
                            bookingProducts: [
                              {
                                id: "c1111111-2222-3333-4444-555555555552",
                                bookingId:
                                  "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                                productId:
                                  "550e8400-e29b-41d4-a716-446655440010",
                                quantity: 2,
                                price: 25000,
                                createdAt: "2026-05-20T10:00:00.000Z",
                                product: {
                                  id: "550e8400-e29b-41d4-a716-446655440010",
                                  centerId:
                                    "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                                  name: "Pocari Sweat 500ml",
                                  description: "Refreshing sports drink",
                                  type: "BEVERAGE",
                                  imageUrl:
                                    "https://cdn.example.com/products/pocari.png",
                                  price: 25000,
                                  unit: "VND / bottle",
                                  stock: 100,
                                  isActive: true,
                                  createdAt: "2026-05-20T10:00:00.000Z",
                                  updatedAt: "2026-05-20T10:00:00.000Z",
                                },
                              },
                            ],
                            items: [
                              {
                                courtId: "f21ddb56-dd63-4e92-9b01-e3bc6784b972",
                                courtName: "San 1",
                                startTime: "17:00",
                                endTime: "19:00",
                                durationHours: 2,
                                breakdown: [
                                  {
                                    startTime: "17:00",
                                    endTime: "17:30",
                                    pricePerHour: 120000,
                                  },
                                  {
                                    startTime: "17:30",
                                    endTime: "18:00",
                                    pricePerHour: 120000,
                                  },
                                  {
                                    startTime: "18:00",
                                    endTime: "18:30",
                                    pricePerHour: 120000,
                                  },
                                  {
                                    startTime: "18:30",
                                    endTime: "19:00",
                                    pricePerHour: 120000,
                                  },
                                ],
                                courtPrice: 240000,
                              },
                              {
                                courtId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                                courtName: "San 2",
                                startTime: "19:00",
                                endTime: "21:00",
                                durationHours: 2,
                                breakdown: [
                                  {
                                    startTime: "19:00",
                                    endTime: "19:30",
                                    pricePerHour: 120000,
                                  },
                                  {
                                    startTime: "19:30",
                                    endTime: "20:00",
                                    pricePerHour: 120000,
                                  },
                                  {
                                    startTime: "20:00",
                                    endTime: "20:30",
                                    pricePerHour: 120000,
                                  },
                                  {
                                    startTime: "20:30",
                                    endTime: "21:00",
                                    pricePerHour: 120000,
                                  },
                                ],
                                courtPrice: 240000,
                              },
                            ],
                            bookingCount: 2,
                            totalCourtPrice: 480000,
                            totalServicePrice: 50000,
                            totalProductPrice: 100000,
                            services: [
                              {
                                id: "550e8400-e29b-41d4-a716-446655440001",
                                name: "Racket Rental",
                                price: 25000,
                                unit: "VND / 3h",
                                quantity: 1,
                                lineTotal: 25000,
                              },
                            ],
                            products: [
                              {
                                id: "550e8400-e29b-41d4-a716-446655440010",
                                name: "Pocari Sweat 500ml",
                                price: 25000,
                                unit: "VND / bottle",
                                stock: 100,
                                quantity: 2,
                                lineTotal: 50000,
                              },
                            ],
                            servicePricePerItem: 25000,
                            productPricePerItem: 50000,
                            player: {
                              id: "user-uuid-1234",
                              name: "Sarah Johnson",
                              email: "sarah@example.com",
                              avatarUrl: "https://example.com/avatar.jpg",
                            },
                          },
                        ],
                        pagination: {
                          limit: 20,
                          offset: 0,
                          total: 1,
                        },
                      },
                    },
                  },
                },
              },
            },
            security: [
              {
                "access-token": [],
              },
            ],
            summary: "List bookings for a center (owner action)",
            tags: ["Bookings"],
          },
        },
        "/api/bookings/me": {
          get: {
            operationId: "BookingController_getMyBookings",
            parameters: [
              {
                name: "status",
                required: false,
                in: "query",
                schema: {
                  type: "string",
                  enum: ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"],
                },
              },
              {
                name: "courtId",
                required: false,
                in: "query",
                description: "Filter by court ID",
                schema: {
                  type: "string",
                },
              },
              {
                name: "centerId",
                required: false,
                in: "query",
                description: "Filter by sport center ID",
                schema: {
                  type: "string",
                },
              },
              {
                name: "date",
                required: false,
                in: "query",
                description:
                  "@deprecated Kept for old frontend code compatibility. Consider using startDate and endDate for better filtering. If provided, this takes precedence and overrides other date filters.",
                schema: {
                  type: "string",
                },
              },
              {
                name: "startDate",
                required: false,
                in: "query",
                description:
                  "Filter by start date (YYYY-MM-DD). Ignored if `date` is provided.",
                schema: {
                  type: "string",
                },
              },
              {
                name: "endDate",
                required: false,
                in: "query",
                description:
                  "Filter by end date (YYYY-MM-DD). Ignored if `date` is provided.",
                schema: {
                  type: "string",
                },
              },
              {
                name: "timeFilter",
                required: false,
                in: "query",
                description:
                  "Filter by past or future bookings. Can be combined with startDate and endDate. Ignored if `date` is provided.",
                schema: {
                  type: "string",
                  enum: ["PAST", "FUTURE"],
                },
              },
              {
                name: "limit",
                required: false,
                in: "query",
                schema: {
                  default: 20,
                  type: "number",
                },
              },
              {
                name: "offset",
                required: false,
                in: "query",
                schema: {
                  default: 0,
                  type: "number",
                },
              },
            ],
            responses: {
              200: {
                description: "My bookings fetched successfully.",
                content: {
                  "application/json": {
                    schema: {
                      example: {
                        data: [
                          {
                            id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                            centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                            playerId: "user-uuid-1234",
                            playerName: "John Doe",
                            phoneNumber: "+66 81 234 5678",
                            date: "2026-05-15T00:00:00.000Z",
                            status: "PENDING",
                            totalPrice: 630000,
                            creditApplied: 0,
                            paymentRemaining: 315000,
                            note: "Need extra balls",
                            playSessionId: null,
                            paymentProofUrl: null,
                            paymentProofUploadedAt: null,
                            expiresAt: "2026-05-06T08:10:00.000Z",
                            bookingTimeoutMinutes: 10,
                            createdAt: "2026-05-06T08:00:00.000Z",
                            updatedAt: "2026-05-06T08:00:00.000Z",
                            cancelledAt: null,
                            cancelReason: null,
                            center: {
                              id: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                              ownerId: "owner-uuid-5678",
                              name: "Pickle Dome Sukhumvit",
                              address: "42 Sukhumvit 49, Watthana, Bangkok",
                              phone: "+66 2 111 2222",
                              email: "hello@pickledome.com",
                              openTime: "06:00",
                              closeTime: "23:00",
                              basePrice: 80000,
                              status: "ACTIVE",
                              amenities: ["Parking", "Shower"],
                              images: [],
                              rules: ["Non-marking shoes only"],
                              description: "Pickle Dome Sukhumvit",
                              paymentAccountName: "NGUYEN VAN AN",
                              paymentAccountNumber: "1234567890",
                              paymentBankName: "VietcomBank",
                              paymentQrUrl:
                                "https://cdn.example.com/qr/sample-qr.png",
                              createdAt: "2026-05-06T08:00:00.000Z",
                              updatedAt: "2026-05-06T08:00:00.000Z",
                              deletedAt: null,
                            },
                            bookingItems: [
                              {
                                id: "i1111111-2222-3333-4444-555555555551",
                                bookingId:
                                  "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                                courtId: "f21ddb56-dd63-4e92-9b01-e3bc6784b972",
                                startTime: "17:00",
                                endTime: "19:00",
                                itemPrice: 240000,
                                createdAt: "2026-05-06T08:00:00.000Z",
                                court: {
                                  id: "f21ddb56-dd63-4e92-9b01-e3bc6784b972",
                                  centerId:
                                    "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                                  name: "San 1",
                                  type: "INDOOR",
                                  status: "ACTIVE",
                                  createdAt: "2026-05-06T08:00:00.000Z",
                                  updatedAt: "2026-05-06T08:00:00.000Z",
                                },
                              },
                              {
                                id: "i1111111-2222-3333-4444-555555555552",
                                bookingId:
                                  "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                                courtId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                                startTime: "19:00",
                                endTime: "21:00",
                                itemPrice: 240000,
                                createdAt: "2026-05-06T08:00:00.000Z",
                                court: {
                                  id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                                  centerId:
                                    "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                                  name: "San 2",
                                  type: "INDOOR",
                                  status: "ACTIVE",
                                  createdAt: "2026-05-06T08:00:00.000Z",
                                  updatedAt: "2026-05-06T08:00:00.000Z",
                                },
                              },
                            ],
                            bookingServices: [
                              {
                                id: "c1111111-2222-3333-4444-555555555551",
                                bookingId:
                                  "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                                serviceId:
                                  "550e8400-e29b-41d4-a716-446655440001",
                                quantity: 1,
                                price: 25000,
                                createdAt: "2026-05-20T10:00:00.000Z",
                                service: {
                                  id: "550e8400-e29b-41d4-a716-446655440001",
                                  centerId:
                                    "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                                  name: "Racket Rental",
                                  description:
                                    "Rent a professional pickleball racket",
                                  type: "EQUIPMENT_RENTAL",
                                  imageUrl:
                                    "https://cdn.example.com/services/racket-rental.png",
                                  price: 25000,
                                  unit: "VND / 3h",
                                  isActive: true,
                                  createdAt: "2026-05-20T10:00:00.000Z",
                                  updatedAt: "2026-05-20T10:00:00.000Z",
                                },
                              },
                            ],
                            bookingProducts: [
                              {
                                id: "c1111111-2222-3333-4444-555555555552",
                                bookingId:
                                  "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                                productId:
                                  "550e8400-e29b-41d4-a716-446655440010",
                                quantity: 2,
                                price: 25000,
                                createdAt: "2026-05-20T10:00:00.000Z",
                                product: {
                                  id: "550e8400-e29b-41d4-a716-446655440010",
                                  centerId:
                                    "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                                  name: "Pocari Sweat 500ml",
                                  description: "Refreshing sports drink",
                                  type: "BEVERAGE",
                                  imageUrl:
                                    "https://cdn.example.com/products/pocari.png",
                                  price: 25000,
                                  unit: "VND / bottle",
                                  stock: 100,
                                  isActive: true,
                                  createdAt: "2026-05-20T10:00:00.000Z",
                                  updatedAt: "2026-05-20T10:00:00.000Z",
                                },
                              },
                            ],
                            items: [
                              {
                                courtId: "f21ddb56-dd63-4e92-9b01-e3bc6784b972",
                                courtName: "San 1",
                                startTime: "17:00",
                                endTime: "19:00",
                                durationHours: 2,
                                breakdown: [
                                  {
                                    startTime: "17:00",
                                    endTime: "17:30",
                                    pricePerHour: 120000,
                                  },
                                  {
                                    startTime: "17:30",
                                    endTime: "18:00",
                                    pricePerHour: 120000,
                                  },
                                  {
                                    startTime: "18:00",
                                    endTime: "18:30",
                                    pricePerHour: 120000,
                                  },
                                  {
                                    startTime: "18:30",
                                    endTime: "19:00",
                                    pricePerHour: 120000,
                                  },
                                ],
                                courtPrice: 240000,
                              },
                              {
                                courtId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                                courtName: "San 2",
                                startTime: "19:00",
                                endTime: "21:00",
                                durationHours: 2,
                                breakdown: [
                                  {
                                    startTime: "19:00",
                                    endTime: "19:30",
                                    pricePerHour: 120000,
                                  },
                                  {
                                    startTime: "19:30",
                                    endTime: "20:00",
                                    pricePerHour: 120000,
                                  },
                                  {
                                    startTime: "20:00",
                                    endTime: "20:30",
                                    pricePerHour: 120000,
                                  },
                                  {
                                    startTime: "20:30",
                                    endTime: "21:00",
                                    pricePerHour: 120000,
                                  },
                                ],
                                courtPrice: 240000,
                              },
                            ],
                            bookingCount: 2,
                            totalCourtPrice: 480000,
                            totalServicePrice: 50000,
                            totalProductPrice: 100000,
                            services: [
                              {
                                id: "550e8400-e29b-41d4-a716-446655440001",
                                name: "Racket Rental",
                                price: 25000,
                                unit: "VND / 3h",
                                quantity: 1,
                                lineTotal: 25000,
                              },
                            ],
                            products: [
                              {
                                id: "550e8400-e29b-41d4-a716-446655440010",
                                name: "Pocari Sweat 500ml",
                                price: 25000,
                                unit: "VND / bottle",
                                stock: 100,
                                quantity: 2,
                                lineTotal: 50000,
                              },
                            ],
                            servicePricePerItem: 25000,
                            productPricePerItem: 50000,
                          },
                        ],
                        pagination: {
                          limit: 20,
                          offset: 0,
                          total: 1,
                        },
                      },
                    },
                  },
                },
              },
            },
            security: [
              {
                "access-token": [],
              },
            ],
            summary: "Get my bookings",
            tags: ["Bookings"],
          },
        },
        "/api/bookings/credits": {
          get: {
            description:
              "Returns all preservation credit balances the logged-in player holds across sport centers. Includes center name and images for display.",
            operationId: "BookingController_getMyCredits",
            parameters: [],
            responses: {
              200: {
                description: "Credit wallets fetched successfully.",
                content: {
                  "application/json": {
                    schema: {
                      example: [
                        {
                          id: "wallet-uuid-1",
                          playerId: "user-uuid-1234",
                          centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                          balance: 240000,
                          center: {
                            id: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                            name: "Pickle Dome Sukhumvit",
                            address: "42 Sukhumvit 49, Watthana, Bangkok",
                            images: ["https://example.com/image1.jpg"],
                          },
                          transactions: [
                            {
                              id: "tx-uuid-1",
                              bookingId: "booking-uuid-1",
                              amount: 240000,
                              type: "CANCELLATION_REFUND",
                              description:
                                "100% preservation credit refund for player-initiated cancellation",
                              createdAt: "2026-05-22T10:00:00.000Z",
                              booking: {
                                id: "booking-uuid-1",
                                date: "2026-05-20T00:00:00.000Z",
                                startTime: "17:00",
                                endTime: "19:00",
                                status: "CANCELLED",
                                totalPrice: 240000,
                                creditApplied: 0,
                                paymentRemaining: 0,
                                center: {
                                  id: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                                  name: "Pickle Dome Sukhumvit",
                                },
                                bookingItems: [
                                  {
                                    startTime: "17:00",
                                    endTime: "18:00",
                                    itemPrice: 120000,
                                    court: {
                                      id: "court-uuid-1",
                                      name: "Court 1",
                                    },
                                  },
                                  {
                                    startTime: "18:00",
                                    endTime: "19:00",
                                    itemPrice: 120000,
                                    court: {
                                      id: "court-uuid-1",
                                      name: "Court 1",
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                          updatedAt: "2026-05-22T10:00:00.000Z",
                        },
                      ],
                    },
                  },
                },
              },
            },
            security: [
              {
                "access-token": [],
              },
            ],
            summary: "Get my preservation credit wallets",
            tags: ["Bookings"],
          },
        },
        "/api/bookings/credits/{centerId}/balance": {
          get: {
            description:
              "Returns only the logged-in player's preservation credit balance at a specific sport center. If the player has no credit wallet yet, returns balance = 0.",
            operationId: "BookingController_getMyCreditBalance",
            parameters: [
              {
                name: "centerId",
                required: true,
                in: "path",
                schema: {
                  type: "string",
                },
              },
            ],
            responses: {
              200: {
                description: "Credit balance fetched successfully.",
                content: {
                  "application/json": {
                    schema: {
                      example: {
                        centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                        balance: 240000,
                      },
                    },
                  },
                },
              },
            },
            security: [
              {
                "access-token": [],
              },
            ],
            summary: "Get my preservation credit balance for a center",
            tags: ["Bookings"],
          },
        },
        "/api/bookings/credits/{centerId}/transactions": {
          get: {
            description:
              "Returns the credit transaction history for the logged-in player at a specific sport center.",
            operationId: "BookingController_getCreditTransactions",
            parameters: [
              {
                name: "centerId",
                required: true,
                in: "path",
                schema: {
                  type: "string",
                },
              },
              {
                name: "limit",
                required: false,
                in: "query",
                schema: {
                  example: 20,
                  type: "string",
                },
              },
              {
                name: "offset",
                required: false,
                in: "query",
                schema: {
                  example: 0,
                  type: "string",
                },
              },
            ],
            responses: {
              200: {
                description: "Credit transaction history fetched successfully.",
                content: {
                  "application/json": {
                    schema: {
                      example: {
                        balance: 240000,
                        center: {
                          id: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                          name: "Pickle Dome Sukhumvit",
                        },
                        transactions: [
                          {
                            id: "tx-uuid-1",
                            bookingId: "booking-uuid-1",
                            amount: 240000,
                            type: "CANCELLATION_REFUND",
                            description:
                              "100% preservation credit refund for player-initiated cancellation",
                            createdAt: "2026-05-22T10:00:00.000Z",
                            booking: {
                              id: "booking-uuid-1",
                              date: "2026-05-20T00:00:00.000Z",
                              startTime: "17:00",
                              endTime: "19:00",
                              status: "CANCELLED",
                              totalPrice: 240000,
                              creditApplied: 0,
                              paymentRemaining: 0,
                              center: {
                                id: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                                name: "Pickle Dome Sukhumvit",
                              },
                              bookingItems: [
                                {
                                  startTime: "17:00",
                                  endTime: "18:00",
                                  itemPrice: 120000,
                                  court: {
                                    id: "court-uuid-1",
                                    name: "Court 1",
                                  },
                                },
                                {
                                  startTime: "18:00",
                                  endTime: "19:00",
                                  itemPrice: 120000,
                                  court: {
                                    id: "court-uuid-1",
                                    name: "Court 1",
                                  },
                                },
                              ],
                            },
                          },
                          {
                            id: "tx-uuid-2",
                            bookingId: "booking-uuid-2",
                            amount: -120000,
                            type: "BOOKING_PAYMENT",
                            description:
                              "Preservation credit applied to booking",
                            createdAt: "2026-05-22T11:00:00.000Z",
                            booking: {
                              id: "booking-uuid-2",
                              date: "2026-05-21T00:00:00.000Z",
                              startTime: "08:00",
                              endTime: "10:00",
                              status: "PENDING",
                              totalPrice: 320000,
                              creditApplied: 120000,
                              paymentRemaining: 200000,
                              center: {
                                id: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                                name: "Pickle Dome Sukhumvit",
                              },
                              bookingItems: [
                                {
                                  startTime: "08:00",
                                  endTime: "09:00",
                                  itemPrice: 160000,
                                  court: {
                                    id: "court-uuid-2",
                                    name: "Court 2",
                                  },
                                },
                                {
                                  startTime: "09:00",
                                  endTime: "10:00",
                                  itemPrice: 160000,
                                  court: {
                                    id: "court-uuid-2",
                                    name: "Court 2",
                                  },
                                },
                              ],
                            },
                          },
                        ],
                      },
                    },
                  },
                },
              },
            },
            security: [
              {
                "access-token": [],
              },
            ],
            summary: "Get preservation credit transaction history",
            tags: ["Bookings"],
          },
        },
        "/api/bookings/{bookingId}": {
          get: {
            operationId: "BookingController_getBookingDetail",
            parameters: [
              {
                name: "bookingId",
                required: true,
                in: "path",
                schema: {
                  type: "string",
                },
              },
            ],
            responses: {
              200: {
                description: "Booking details fetched successfully.",
                content: {
                  "application/json": {
                    schema: {
                      example: {
                        id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                        centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                        playerId: "user-uuid-1234",
                        playerName: "John Doe",
                        phoneNumber: "+66 81 234 5678",
                        date: "2026-05-15T00:00:00.000Z",
                        status: "PENDING",
                        totalPrice: 630000,
                        creditApplied: 0,
                        paymentRemaining: 315000,
                        note: "Need extra balls",
                        playSessionId: null,
                        paymentProofUrl: null,
                        paymentProofUploadedAt: null,
                        expiresAt: "2026-05-06T08:10:00.000Z",
                        bookingTimeoutMinutes: 10,
                        createdAt: "2026-05-06T08:00:00.000Z",
                        updatedAt: "2026-05-06T08:00:00.000Z",
                        cancelledAt: null,
                        cancelReason: null,
                        center: {
                          id: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                          ownerId: "owner-uuid-5678",
                          name: "Pickle Dome Sukhumvit",
                          address: "42 Sukhumvit 49, Watthana, Bangkok",
                          phone: "+66 2 111 2222",
                          email: "hello@pickledome.com",
                          openTime: "06:00",
                          closeTime: "23:00",
                          basePrice: 80000,
                          status: "ACTIVE",
                          amenities: ["Parking", "Shower"],
                          images: [],
                          rules: ["Non-marking shoes only"],
                          description: "Pickle Dome Sukhumvit",
                          paymentAccountName: "NGUYEN VAN AN",
                          paymentAccountNumber: "1234567890",
                          paymentBankName: "VietcomBank",
                          paymentQrUrl:
                            "https://cdn.example.com/qr/sample-qr.png",
                          createdAt: "2026-05-06T08:00:00.000Z",
                          updatedAt: "2026-05-06T08:00:00.000Z",
                          deletedAt: null,
                        },
                        bookingItems: [
                          {
                            id: "i1111111-2222-3333-4444-555555555551",
                            bookingId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                            courtId: "f21ddb56-dd63-4e92-9b01-e3bc6784b972",
                            startTime: "17:00",
                            endTime: "19:00",
                            itemPrice: 240000,
                            createdAt: "2026-05-06T08:00:00.000Z",
                            court: {
                              id: "f21ddb56-dd63-4e92-9b01-e3bc6784b972",
                              centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                              name: "San 1",
                              type: "INDOOR",
                              status: "ACTIVE",
                              createdAt: "2026-05-06T08:00:00.000Z",
                              updatedAt: "2026-05-06T08:00:00.000Z",
                            },
                          },
                          {
                            id: "i1111111-2222-3333-4444-555555555552",
                            bookingId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                            courtId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                            startTime: "19:00",
                            endTime: "21:00",
                            itemPrice: 240000,
                            createdAt: "2026-05-06T08:00:00.000Z",
                            court: {
                              id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                              centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                              name: "San 2",
                              type: "INDOOR",
                              status: "ACTIVE",
                              createdAt: "2026-05-06T08:00:00.000Z",
                              updatedAt: "2026-05-06T08:00:00.000Z",
                            },
                          },
                        ],
                        bookingServices: [
                          {
                            id: "c1111111-2222-3333-4444-555555555551",
                            bookingId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                            serviceId: "550e8400-e29b-41d4-a716-446655440001",
                            quantity: 1,
                            price: 25000,
                            createdAt: "2026-05-20T10:00:00.000Z",
                            service: {
                              id: "550e8400-e29b-41d4-a716-446655440001",
                              centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                              name: "Racket Rental",
                              description:
                                "Rent a professional pickleball racket",
                              type: "EQUIPMENT_RENTAL",
                              imageUrl:
                                "https://cdn.example.com/services/racket-rental.png",
                              price: 25000,
                              unit: "VND / 3h",
                              isActive: true,
                              createdAt: "2026-05-20T10:00:00.000Z",
                              updatedAt: "2026-05-20T10:00:00.000Z",
                            },
                          },
                        ],
                        bookingProducts: [
                          {
                            id: "c1111111-2222-3333-4444-555555555552",
                            bookingId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                            productId: "550e8400-e29b-41d4-a716-446655440010",
                            quantity: 2,
                            price: 25000,
                            createdAt: "2026-05-20T10:00:00.000Z",
                            product: {
                              id: "550e8400-e29b-41d4-a716-446655440010",
                              centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                              name: "Pocari Sweat 500ml",
                              description: "Refreshing sports drink",
                              type: "BEVERAGE",
                              imageUrl:
                                "https://cdn.example.com/products/pocari.png",
                              price: 25000,
                              unit: "VND / bottle",
                              stock: 100,
                              isActive: true,
                              createdAt: "2026-05-20T10:00:00.000Z",
                              updatedAt: "2026-05-20T10:00:00.000Z",
                            },
                          },
                        ],
                        items: [
                          {
                            courtId: "f21ddb56-dd63-4e92-9b01-e3bc6784b972",
                            courtName: "San 1",
                            startTime: "17:00",
                            endTime: "19:00",
                            durationHours: 2,
                            breakdown: [
                              {
                                startTime: "17:00",
                                endTime: "17:30",
                                pricePerHour: 120000,
                              },
                              {
                                startTime: "17:30",
                                endTime: "18:00",
                                pricePerHour: 120000,
                              },
                              {
                                startTime: "18:00",
                                endTime: "18:30",
                                pricePerHour: 120000,
                              },
                              {
                                startTime: "18:30",
                                endTime: "19:00",
                                pricePerHour: 120000,
                              },
                            ],
                            courtPrice: 240000,
                          },
                          {
                            courtId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                            courtName: "San 2",
                            startTime: "19:00",
                            endTime: "21:00",
                            durationHours: 2,
                            breakdown: [
                              {
                                startTime: "19:00",
                                endTime: "19:30",
                                pricePerHour: 120000,
                              },
                              {
                                startTime: "19:30",
                                endTime: "20:00",
                                pricePerHour: 120000,
                              },
                              {
                                startTime: "20:00",
                                endTime: "20:30",
                                pricePerHour: 120000,
                              },
                              {
                                startTime: "20:30",
                                endTime: "21:00",
                                pricePerHour: 120000,
                              },
                            ],
                            courtPrice: 240000,
                          },
                        ],
                        bookingCount: 2,
                        totalCourtPrice: 480000,
                        totalServicePrice: 50000,
                        totalProductPrice: 100000,
                        services: [
                          {
                            id: "550e8400-e29b-41d4-a716-446655440001",
                            name: "Racket Rental",
                            price: 25000,
                            unit: "VND / 3h",
                            quantity: 1,
                            lineTotal: 25000,
                          },
                        ],
                        products: [
                          {
                            id: "550e8400-e29b-41d4-a716-446655440010",
                            name: "Pocari Sweat 500ml",
                            price: 25000,
                            unit: "VND / bottle",
                            stock: 100,
                            quantity: 2,
                            lineTotal: 50000,
                          },
                        ],
                        servicePricePerItem: 25000,
                        productPricePerItem: 50000,
                      },
                    },
                  },
                },
              },
            },
            security: [
              {
                "access-token": [],
              },
            ],
            summary: "Get booking details",
            tags: ["Bookings"],
          },
        },
        "/api/bookings/{bookingId}/cancel": {
          patch: {
            description:
              "Player cancels their own booking. Behavior depends on booking status and center policy:\n\n**PENDING booking:** always cancellable. Any preservation credit that was applied at checkout (`creditApplied`) is immediately returned to the player's wallet.\n\n**CONFIRMED booking:** only allowed when the center has `allowCancellation: true`. The center's cancellation tiers determine the refund percentage based on how many whole days remain before the booking start time. The refund is issued as preservation credit (not cash). If no tier qualifies (e.g. cancellation is too close to start time), 0% is refunded.\n\n**COMPLETED / CANCELLED:** not cancellable.",
            operationId: "BookingController_cancelBooking",
            parameters: [
              {
                name: "bookingId",
                required: true,
                in: "path",
                schema: {
                  type: "string",
                },
              },
              {
                name: "cancel_reason",
                required: false,
                in: "query",
                description:
                  "Optional free-text reason for cancellation. Defaults to PLAYER_CANCEL for users.",
                schema: {
                  type: "string",
                },
              },
            ],
            responses: {
              200: {
                description: "Booking cancelled successfully.",
                content: {
                  "application/json": {
                    schema: {
                      example: {
                        id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                        centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                        playerId: "user-uuid-1234",
                        playerName: "John Doe",
                        phoneNumber: "+66 81 234 5678",
                        date: "2026-05-15T00:00:00.000Z",
                        status: "CANCELLED",
                        totalPrice: 630000,
                        creditApplied: 0,
                        paymentRemaining: 315000,
                        note: "Need extra balls",
                        playSessionId: null,
                        paymentProofUrl: null,
                        paymentProofUploadedAt: null,
                        expiresAt: "2026-05-06T08:10:00.000Z",
                        bookingTimeoutMinutes: 10,
                        createdAt: "2026-05-06T08:00:00.000Z",
                        updatedAt: "2026-05-06T08:05:00.000Z",
                        cancelledAt: "2026-05-06T08:05:00.000Z",
                        cancelReason: "PLAYER_CANCEL",
                        center: {
                          id: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                          ownerId: "owner-uuid-5678",
                          name: "Pickle Dome Sukhumvit",
                          address: "42 Sukhumvit 49, Watthana, Bangkok",
                          phone: "+66 2 111 2222",
                          email: "hello@pickledome.com",
                          openTime: "06:00",
                          closeTime: "23:00",
                          basePrice: 80000,
                          status: "ACTIVE",
                          amenities: ["Parking", "Shower"],
                          images: [],
                          rules: ["Non-marking shoes only"],
                          description: "Pickle Dome Sukhumvit",
                          paymentAccountName: "NGUYEN VAN AN",
                          paymentAccountNumber: "1234567890",
                          paymentBankName: "VietcomBank",
                          paymentQrUrl:
                            "https://cdn.example.com/qr/sample-qr.png",
                          createdAt: "2026-05-06T08:00:00.000Z",
                          updatedAt: "2026-05-06T08:00:00.000Z",
                          deletedAt: null,
                        },
                        bookingItems: [
                          {
                            id: "i1111111-2222-3333-4444-555555555551",
                            bookingId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                            courtId: "f21ddb56-dd63-4e92-9b01-e3bc6784b972",
                            startTime: "17:00",
                            endTime: "19:00",
                            itemPrice: 240000,
                            createdAt: "2026-05-06T08:00:00.000Z",
                            court: {
                              id: "f21ddb56-dd63-4e92-9b01-e3bc6784b972",
                              centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                              name: "San 1",
                              type: "INDOOR",
                              status: "ACTIVE",
                              createdAt: "2026-05-06T08:00:00.000Z",
                              updatedAt: "2026-05-06T08:00:00.000Z",
                            },
                          },
                          {
                            id: "i1111111-2222-3333-4444-555555555552",
                            bookingId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                            courtId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                            startTime: "19:00",
                            endTime: "21:00",
                            itemPrice: 240000,
                            createdAt: "2026-05-06T08:00:00.000Z",
                            court: {
                              id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                              centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                              name: "San 2",
                              type: "INDOOR",
                              status: "ACTIVE",
                              createdAt: "2026-05-06T08:00:00.000Z",
                              updatedAt: "2026-05-06T08:00:00.000Z",
                            },
                          },
                        ],
                        bookingServices: [
                          {
                            id: "c1111111-2222-3333-4444-555555555551",
                            bookingId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                            serviceId: "550e8400-e29b-41d4-a716-446655440001",
                            quantity: 1,
                            price: 25000,
                            createdAt: "2026-05-20T10:00:00.000Z",
                            service: {
                              id: "550e8400-e29b-41d4-a716-446655440001",
                              centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                              name: "Racket Rental",
                              description:
                                "Rent a professional pickleball racket",
                              type: "EQUIPMENT_RENTAL",
                              imageUrl:
                                "https://cdn.example.com/services/racket-rental.png",
                              price: 25000,
                              unit: "VND / 3h",
                              isActive: true,
                              createdAt: "2026-05-20T10:00:00.000Z",
                              updatedAt: "2026-05-20T10:00:00.000Z",
                            },
                          },
                        ],
                        bookingProducts: [
                          {
                            id: "c1111111-2222-3333-4444-555555555552",
                            bookingId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                            productId: "550e8400-e29b-41d4-a716-446655440010",
                            quantity: 2,
                            price: 25000,
                            createdAt: "2026-05-20T10:00:00.000Z",
                            product: {
                              id: "550e8400-e29b-41d4-a716-446655440010",
                              centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                              name: "Pocari Sweat 500ml",
                              description: "Refreshing sports drink",
                              type: "BEVERAGE",
                              imageUrl:
                                "https://cdn.example.com/products/pocari.png",
                              price: 25000,
                              unit: "VND / bottle",
                              stock: 100,
                              isActive: true,
                              createdAt: "2026-05-20T10:00:00.000Z",
                              updatedAt: "2026-05-20T10:00:00.000Z",
                            },
                          },
                        ],
                        items: [
                          {
                            courtId: "f21ddb56-dd63-4e92-9b01-e3bc6784b972",
                            courtName: "San 1",
                            startTime: "17:00",
                            endTime: "19:00",
                            durationHours: 2,
                            breakdown: [
                              {
                                startTime: "17:00",
                                endTime: "17:30",
                                pricePerHour: 120000,
                              },
                              {
                                startTime: "17:30",
                                endTime: "18:00",
                                pricePerHour: 120000,
                              },
                              {
                                startTime: "18:00",
                                endTime: "18:30",
                                pricePerHour: 120000,
                              },
                              {
                                startTime: "18:30",
                                endTime: "19:00",
                                pricePerHour: 120000,
                              },
                            ],
                            courtPrice: 240000,
                          },
                          {
                            courtId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                            courtName: "San 2",
                            startTime: "19:00",
                            endTime: "21:00",
                            durationHours: 2,
                            breakdown: [
                              {
                                startTime: "19:00",
                                endTime: "19:30",
                                pricePerHour: 120000,
                              },
                              {
                                startTime: "19:30",
                                endTime: "20:00",
                                pricePerHour: 120000,
                              },
                              {
                                startTime: "20:00",
                                endTime: "20:30",
                                pricePerHour: 120000,
                              },
                              {
                                startTime: "20:30",
                                endTime: "21:00",
                                pricePerHour: 120000,
                              },
                            ],
                            courtPrice: 240000,
                          },
                        ],
                        bookingCount: 2,
                        totalCourtPrice: 480000,
                        totalServicePrice: 50000,
                        totalProductPrice: 100000,
                        services: [
                          {
                            id: "550e8400-e29b-41d4-a716-446655440001",
                            name: "Racket Rental",
                            price: 25000,
                            unit: "VND / 3h",
                            quantity: 1,
                            lineTotal: 25000,
                          },
                        ],
                        products: [
                          {
                            id: "550e8400-e29b-41d4-a716-446655440010",
                            name: "Pocari Sweat 500ml",
                            price: 25000,
                            unit: "VND / bottle",
                            stock: 100,
                            quantity: 2,
                            lineTotal: 50000,
                          },
                        ],
                        servicePricePerItem: 25000,
                        productPricePerItem: 50000,
                      },
                    },
                  },
                },
              },
              400: {
                description:
                  "Booking already cancelled/completed, or center does not allow cancellations.",
              },
            },
            security: [
              {
                "access-token": [],
              },
            ],
            summary: "Cancel my booking",
            tags: ["Bookings"],
          },
        },
        "/api/bookings/{bookingId}/payment-proof": {
          patch: {
            description:
              "Player uploads the URL of their bank transfer screenshot. The booking must be in PENDING status. **Must be submitted within 10 minutes** of booking creation (before `expiresAt`), otherwise the booking will be automatically cancelled. Once proof is uploaded, the booking is safe from auto-cancellation. The center owner will then review the proof and confirm or cancel the booking.",
            operationId: "BookingController_submitPaymentProof",
            parameters: [
              {
                name: "bookingId",
                required: true,
                in: "path",
                schema: {
                  type: "string",
                },
              },
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/SubmitPaymentProofDto",
                  },
                },
              },
            },
            responses: {
              200: {
                description: "Payment proof submitted successfully.",
                content: {
                  "application/json": {
                    schema: {
                      example: {
                        id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                        centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                        playerId: "user-uuid-1234",
                        playerName: "John Doe",
                        phoneNumber: "+66 81 234 5678",
                        date: "2026-05-15T00:00:00.000Z",
                        status: "PENDING",
                        totalPrice: 630000,
                        creditApplied: 0,
                        paymentRemaining: 315000,
                        note: "Need extra balls",
                        playSessionId: null,
                        paymentProofUrl:
                          "https://cdn.example.com/proofs/transfer-receipt.jpg",
                        paymentProofUploadedAt: "2026-05-06T08:03:00.000Z",
                        expiresAt: "2026-05-06T08:10:00.000Z",
                        bookingTimeoutMinutes: 10,
                        createdAt: "2026-05-06T08:00:00.000Z",
                        updatedAt: "2026-05-06T08:03:00.000Z",
                        cancelledAt: null,
                        cancelReason: null,
                        center: {
                          id: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                          ownerId: "owner-uuid-5678",
                          name: "Pickle Dome Sukhumvit",
                          address: "42 Sukhumvit 49, Watthana, Bangkok",
                          phone: "+66 2 111 2222",
                          email: "hello@pickledome.com",
                          openTime: "06:00",
                          closeTime: "23:00",
                          basePrice: 80000,
                          status: "ACTIVE",
                          amenities: ["Parking", "Shower"],
                          images: [],
                          rules: ["Non-marking shoes only"],
                          description: "Pickle Dome Sukhumvit",
                          paymentAccountName: "NGUYEN VAN AN",
                          paymentAccountNumber: "1234567890",
                          paymentBankName: "VietcomBank",
                          paymentQrUrl:
                            "https://cdn.example.com/qr/sample-qr.png",
                          createdAt: "2026-05-06T08:00:00.000Z",
                          updatedAt: "2026-05-06T08:00:00.000Z",
                          deletedAt: null,
                        },
                        bookingItems: [
                          {
                            id: "i1111111-2222-3333-4444-555555555551",
                            bookingId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                            courtId: "f21ddb56-dd63-4e92-9b01-e3bc6784b972",
                            startTime: "17:00",
                            endTime: "19:00",
                            itemPrice: 240000,
                            createdAt: "2026-05-06T08:00:00.000Z",
                            court: {
                              id: "f21ddb56-dd63-4e92-9b01-e3bc6784b972",
                              centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                              name: "San 1",
                              type: "INDOOR",
                              status: "ACTIVE",
                              createdAt: "2026-05-06T08:00:00.000Z",
                              updatedAt: "2026-05-06T08:00:00.000Z",
                            },
                          },
                          {
                            id: "i1111111-2222-3333-4444-555555555552",
                            bookingId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                            courtId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                            startTime: "19:00",
                            endTime: "21:00",
                            itemPrice: 240000,
                            createdAt: "2026-05-06T08:00:00.000Z",
                            court: {
                              id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                              centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                              name: "San 2",
                              type: "INDOOR",
                              status: "ACTIVE",
                              createdAt: "2026-05-06T08:00:00.000Z",
                              updatedAt: "2026-05-06T08:00:00.000Z",
                            },
                          },
                        ],
                        bookingServices: [
                          {
                            id: "c1111111-2222-3333-4444-555555555551",
                            bookingId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                            serviceId: "550e8400-e29b-41d4-a716-446655440001",
                            quantity: 1,
                            price: 25000,
                            createdAt: "2026-05-20T10:00:00.000Z",
                            service: {
                              id: "550e8400-e29b-41d4-a716-446655440001",
                              centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                              name: "Racket Rental",
                              description:
                                "Rent a professional pickleball racket",
                              type: "EQUIPMENT_RENTAL",
                              imageUrl:
                                "https://cdn.example.com/services/racket-rental.png",
                              price: 25000,
                              unit: "VND / 3h",
                              isActive: true,
                              createdAt: "2026-05-20T10:00:00.000Z",
                              updatedAt: "2026-05-20T10:00:00.000Z",
                            },
                          },
                        ],
                        bookingProducts: [
                          {
                            id: "c1111111-2222-3333-4444-555555555552",
                            bookingId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                            productId: "550e8400-e29b-41d4-a716-446655440010",
                            quantity: 2,
                            price: 25000,
                            createdAt: "2026-05-20T10:00:00.000Z",
                            product: {
                              id: "550e8400-e29b-41d4-a716-446655440010",
                              centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                              name: "Pocari Sweat 500ml",
                              description: "Refreshing sports drink",
                              type: "BEVERAGE",
                              imageUrl:
                                "https://cdn.example.com/products/pocari.png",
                              price: 25000,
                              unit: "VND / bottle",
                              stock: 100,
                              isActive: true,
                              createdAt: "2026-05-20T10:00:00.000Z",
                              updatedAt: "2026-05-20T10:00:00.000Z",
                            },
                          },
                        ],
                        items: [
                          {
                            courtId: "f21ddb56-dd63-4e92-9b01-e3bc6784b972",
                            courtName: "San 1",
                            startTime: "17:00",
                            endTime: "19:00",
                            durationHours: 2,
                            breakdown: [
                              {
                                startTime: "17:00",
                                endTime: "17:30",
                                pricePerHour: 120000,
                              },
                              {
                                startTime: "17:30",
                                endTime: "18:00",
                                pricePerHour: 120000,
                              },
                              {
                                startTime: "18:00",
                                endTime: "18:30",
                                pricePerHour: 120000,
                              },
                              {
                                startTime: "18:30",
                                endTime: "19:00",
                                pricePerHour: 120000,
                              },
                            ],
                            courtPrice: 240000,
                          },
                          {
                            courtId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                            courtName: "San 2",
                            startTime: "19:00",
                            endTime: "21:00",
                            durationHours: 2,
                            breakdown: [
                              {
                                startTime: "19:00",
                                endTime: "19:30",
                                pricePerHour: 120000,
                              },
                              {
                                startTime: "19:30",
                                endTime: "20:00",
                                pricePerHour: 120000,
                              },
                              {
                                startTime: "20:00",
                                endTime: "20:30",
                                pricePerHour: 120000,
                              },
                              {
                                startTime: "20:30",
                                endTime: "21:00",
                                pricePerHour: 120000,
                              },
                            ],
                            courtPrice: 240000,
                          },
                        ],
                        bookingCount: 2,
                        totalCourtPrice: 480000,
                        totalServicePrice: 50000,
                        totalProductPrice: 100000,
                        services: [
                          {
                            id: "550e8400-e29b-41d4-a716-446655440001",
                            name: "Racket Rental",
                            price: 25000,
                            unit: "VND / 3h",
                            quantity: 1,
                            lineTotal: 25000,
                          },
                        ],
                        products: [
                          {
                            id: "550e8400-e29b-41d4-a716-446655440010",
                            name: "Pocari Sweat 500ml",
                            price: 25000,
                            unit: "VND / bottle",
                            stock: 100,
                            quantity: 2,
                            lineTotal: 50000,
                          },
                        ],
                        servicePricePerItem: 25000,
                        productPricePerItem: 50000,
                      },
                    },
                  },
                },
              },
              400: {
                description: "Booking is not in PENDING status.",
              },
              404: {
                description: "Booking not found.",
              },
            },
            security: [
              {
                "access-token": [],
              },
            ],
            summary: "Submit payment proof (player action)",
            tags: ["Bookings"],
          },
        },
        "/api/bookings/{bookingId}/cancel-by-owner": {
          patch: {
            description:
              "Owner of the sport center cancels a single booking. Sets status to CANCELLED with cancelReason=OWNER_MANUAL and notifies the affected player. \n\n**Preservation credit:** if the cancelled booking was CONFIRMED, the player automatically receives **100% of `totalPrice`** back as preservation credit at this sport center — regardless of the center's cancellation tier policy (owner fault = full refund).",
            operationId: "BookingController_cancelBookingByOwner",
            parameters: [
              {
                name: "bookingId",
                required: true,
                in: "path",
                schema: {
                  type: "string",
                },
              },
              {
                name: "cancel_reason",
                required: false,
                in: "query",
                description:
                  "Optional free-text reason for cancellation. Defaults to OWNER_MANUAL for owners.",
                schema: {
                  type: "string",
                },
              },
            ],
            responses: {
              200: {
                description:
                  "Booking cancelled successfully. Player receives full preservation credit if booking was CONFIRMED.",
                content: {
                  "application/json": {
                    schema: {
                      example: {
                        id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                        centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                        playerId: "user-uuid-1234",
                        playerName: "John Doe",
                        phoneNumber: "+66 81 234 5678",
                        date: "2026-05-15T00:00:00.000Z",
                        status: "CONFIRMED",
                        totalPrice: 630000,
                        creditApplied: 0,
                        paymentRemaining: 0,
                        note: "Need extra balls",
                        playSessionId: null,
                        paymentProofUrl: null,
                        paymentProofUploadedAt: null,
                        expiresAt: "2026-05-06T08:10:00.000Z",
                        bookingTimeoutMinutes: 10,
                        createdAt: "2026-05-06T08:00:00.000Z",
                        updatedAt: "2026-05-06T08:05:00.000Z",
                        cancelledAt: "2026-05-06T08:05:00.000Z",
                        cancelReason: "OWNER_MANUAL",
                        center: {
                          id: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                          ownerId: "owner-uuid-5678",
                          name: "Pickle Dome Sukhumvit",
                          address: "42 Sukhumvit 49, Watthana, Bangkok",
                          phone: "+66 2 111 2222",
                          email: "hello@pickledome.com",
                          openTime: "06:00",
                          closeTime: "23:00",
                          basePrice: 80000,
                          status: "ACTIVE",
                          amenities: ["Parking", "Shower"],
                          images: [],
                          rules: ["Non-marking shoes only"],
                          description: "Pickle Dome Sukhumvit",
                          paymentAccountName: "NGUYEN VAN AN",
                          paymentAccountNumber: "1234567890",
                          paymentBankName: "VietcomBank",
                          paymentQrUrl:
                            "https://cdn.example.com/qr/sample-qr.png",
                          createdAt: "2026-05-06T08:00:00.000Z",
                          updatedAt: "2026-05-06T08:00:00.000Z",
                          deletedAt: null,
                        },
                        bookingItems: [
                          {
                            id: "i1111111-2222-3333-4444-555555555551",
                            bookingId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                            courtId: "f21ddb56-dd63-4e92-9b01-e3bc6784b972",
                            startTime: "17:00",
                            endTime: "19:00",
                            itemPrice: 240000,
                            createdAt: "2026-05-06T08:00:00.000Z",
                            court: {
                              id: "f21ddb56-dd63-4e92-9b01-e3bc6784b972",
                              centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                              name: "San 1",
                              type: "INDOOR",
                              status: "ACTIVE",
                              createdAt: "2026-05-06T08:00:00.000Z",
                              updatedAt: "2026-05-06T08:00:00.000Z",
                            },
                          },
                          {
                            id: "i1111111-2222-3333-4444-555555555552",
                            bookingId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                            courtId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                            startTime: "19:00",
                            endTime: "21:00",
                            itemPrice: 240000,
                            createdAt: "2026-05-06T08:00:00.000Z",
                            court: {
                              id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                              centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                              name: "San 2",
                              type: "INDOOR",
                              status: "ACTIVE",
                              createdAt: "2026-05-06T08:00:00.000Z",
                              updatedAt: "2026-05-06T08:00:00.000Z",
                            },
                          },
                        ],
                        bookingServices: [
                          {
                            id: "c1111111-2222-3333-4444-555555555551",
                            bookingId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                            serviceId: "550e8400-e29b-41d4-a716-446655440001",
                            quantity: 1,
                            price: 25000,
                            createdAt: "2026-05-20T10:00:00.000Z",
                            service: {
                              id: "550e8400-e29b-41d4-a716-446655440001",
                              centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                              name: "Racket Rental",
                              description:
                                "Rent a professional pickleball racket",
                              type: "EQUIPMENT_RENTAL",
                              imageUrl:
                                "https://cdn.example.com/services/racket-rental.png",
                              price: 25000,
                              unit: "VND / 3h",
                              isActive: true,
                              createdAt: "2026-05-20T10:00:00.000Z",
                              updatedAt: "2026-05-20T10:00:00.000Z",
                            },
                          },
                        ],
                        bookingProducts: [
                          {
                            id: "c1111111-2222-3333-4444-555555555552",
                            bookingId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                            productId: "550e8400-e29b-41d4-a716-446655440010",
                            quantity: 2,
                            price: 25000,
                            createdAt: "2026-05-20T10:00:00.000Z",
                            product: {
                              id: "550e8400-e29b-41d4-a716-446655440010",
                              centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                              name: "Pocari Sweat 500ml",
                              description: "Refreshing sports drink",
                              type: "BEVERAGE",
                              imageUrl:
                                "https://cdn.example.com/products/pocari.png",
                              price: 25000,
                              unit: "VND / bottle",
                              stock: 100,
                              isActive: true,
                              createdAt: "2026-05-20T10:00:00.000Z",
                              updatedAt: "2026-05-20T10:00:00.000Z",
                            },
                          },
                        ],
                        items: [
                          {
                            courtId: "f21ddb56-dd63-4e92-9b01-e3bc6784b972",
                            courtName: "San 1",
                            startTime: "17:00",
                            endTime: "19:00",
                            durationHours: 2,
                            breakdown: [
                              {
                                startTime: "17:00",
                                endTime: "17:30",
                                pricePerHour: 120000,
                              },
                              {
                                startTime: "17:30",
                                endTime: "18:00",
                                pricePerHour: 120000,
                              },
                              {
                                startTime: "18:00",
                                endTime: "18:30",
                                pricePerHour: 120000,
                              },
                              {
                                startTime: "18:30",
                                endTime: "19:00",
                                pricePerHour: 120000,
                              },
                            ],
                            courtPrice: 240000,
                          },
                          {
                            courtId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                            courtName: "San 2",
                            startTime: "19:00",
                            endTime: "21:00",
                            durationHours: 2,
                            breakdown: [
                              {
                                startTime: "19:00",
                                endTime: "19:30",
                                pricePerHour: 120000,
                              },
                              {
                                startTime: "19:30",
                                endTime: "20:00",
                                pricePerHour: 120000,
                              },
                              {
                                startTime: "20:00",
                                endTime: "20:30",
                                pricePerHour: 120000,
                              },
                              {
                                startTime: "20:30",
                                endTime: "21:00",
                                pricePerHour: 120000,
                              },
                            ],
                            courtPrice: 240000,
                          },
                        ],
                        bookingCount: 2,
                        totalCourtPrice: 480000,
                        totalServicePrice: 50000,
                        totalProductPrice: 100000,
                        services: [
                          {
                            id: "550e8400-e29b-41d4-a716-446655440001",
                            name: "Racket Rental",
                            price: 25000,
                            unit: "VND / 3h",
                            quantity: 1,
                            lineTotal: 25000,
                          },
                        ],
                        products: [
                          {
                            id: "550e8400-e29b-41d4-a716-446655440010",
                            name: "Pocari Sweat 500ml",
                            price: 25000,
                            unit: "VND / bottle",
                            stock: 100,
                            quantity: 2,
                            lineTotal: 50000,
                          },
                        ],
                        servicePricePerItem: 25000,
                        productPricePerItem: 50000,
                      },
                    },
                  },
                },
              },
              400: {
                description: "Booking is already cancelled/completed.",
              },
              403: {
                description: "Caller is not the owner of the sport center.",
              },
              404: {
                description: "Booking not found.",
              },
            },
            security: [
              {
                "access-token": [],
              },
            ],
            summary: "Cancel a booking (owner action)",
            tags: ["Bookings"],
          },
        },
        "/api/sport-centers/{centerId}/bookings/by-owner": {
          post: {
            description:
              "Owner creates one booking aggregate with one or more court-time items for a walk-in or offline player. The booking is automatically CONFIRMED and can include services, products, and an optional retyped phone number.",
            operationId: "BookingController_createBookingByOwner",
            parameters: [
              {
                name: "centerId",
                required: true,
                in: "path",
                schema: {
                  type: "string",
                },
              },
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/OwnerCreateBookingDto",
                  },
                },
              },
            },
            responses: {
              201: {
                description: "Booking created successfully.",
                content: {
                  "application/json": {
                    schema: {
                      example: {
                        id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                        centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                        playerId: "user-uuid-1234",
                        playerName: "John Doe",
                        phoneNumber: "+66 81 234 5678",
                        date: "2026-05-15T00:00:00.000Z",
                        status: "CONFIRMED",
                        totalPrice: 630000,
                        creditApplied: 0,
                        paymentRemaining: 0,
                        note: "Need extra balls",
                        playSessionId: null,
                        paymentProofUrl: null,
                        paymentProofUploadedAt: null,
                        expiresAt: null,
                        bookingTimeoutMinutes: null,
                        createdAt: "2026-05-06T08:00:00.000Z",
                        updatedAt: "2026-05-06T08:00:00.000Z",
                        cancelledAt: null,
                        cancelReason: null,
                        center: {
                          id: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                          ownerId: "owner-uuid-5678",
                          name: "Pickle Dome Sukhumvit",
                          address: "42 Sukhumvit 49, Watthana, Bangkok",
                          phone: "+66 2 111 2222",
                          email: "hello@pickledome.com",
                          openTime: "06:00",
                          closeTime: "23:00",
                          basePrice: 80000,
                          status: "ACTIVE",
                          amenities: ["Parking", "Shower"],
                          images: [],
                          rules: ["Non-marking shoes only"],
                          description: "Pickle Dome Sukhumvit",
                          paymentAccountName: "NGUYEN VAN AN",
                          paymentAccountNumber: "1234567890",
                          paymentBankName: "VietcomBank",
                          paymentQrUrl:
                            "https://cdn.example.com/qr/sample-qr.png",
                          createdAt: "2026-05-06T08:00:00.000Z",
                          updatedAt: "2026-05-06T08:00:00.000Z",
                          deletedAt: null,
                        },
                        bookingItems: [
                          {
                            id: "i1111111-2222-3333-4444-555555555551",
                            bookingId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                            courtId: "f21ddb56-dd63-4e92-9b01-e3bc6784b972",
                            startTime: "17:00",
                            endTime: "19:00",
                            itemPrice: 240000,
                            createdAt: "2026-05-06T08:00:00.000Z",
                            court: {
                              id: "f21ddb56-dd63-4e92-9b01-e3bc6784b972",
                              centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                              name: "San 1",
                              type: "INDOOR",
                              status: "ACTIVE",
                              createdAt: "2026-05-06T08:00:00.000Z",
                              updatedAt: "2026-05-06T08:00:00.000Z",
                            },
                          },
                          {
                            id: "i1111111-2222-3333-4444-555555555552",
                            bookingId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                            courtId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                            startTime: "19:00",
                            endTime: "21:00",
                            itemPrice: 240000,
                            createdAt: "2026-05-06T08:00:00.000Z",
                            court: {
                              id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                              centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                              name: "San 2",
                              type: "INDOOR",
                              status: "ACTIVE",
                              createdAt: "2026-05-06T08:00:00.000Z",
                              updatedAt: "2026-05-06T08:00:00.000Z",
                            },
                          },
                        ],
                        bookingServices: [
                          {
                            id: "c1111111-2222-3333-4444-555555555551",
                            bookingId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                            serviceId: "550e8400-e29b-41d4-a716-446655440001",
                            quantity: 1,
                            price: 25000,
                            createdAt: "2026-05-20T10:00:00.000Z",
                            service: {
                              id: "550e8400-e29b-41d4-a716-446655440001",
                              centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                              name: "Racket Rental",
                              description:
                                "Rent a professional pickleball racket",
                              type: "EQUIPMENT_RENTAL",
                              imageUrl:
                                "https://cdn.example.com/services/racket-rental.png",
                              price: 25000,
                              unit: "VND / 3h",
                              isActive: true,
                              createdAt: "2026-05-20T10:00:00.000Z",
                              updatedAt: "2026-05-20T10:00:00.000Z",
                            },
                          },
                        ],
                        bookingProducts: [
                          {
                            id: "c1111111-2222-3333-4444-555555555552",
                            bookingId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                            productId: "550e8400-e29b-41d4-a716-446655440010",
                            quantity: 2,
                            price: 25000,
                            createdAt: "2026-05-20T10:00:00.000Z",
                            product: {
                              id: "550e8400-e29b-41d4-a716-446655440010",
                              centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                              name: "Pocari Sweat 500ml",
                              description: "Refreshing sports drink",
                              type: "BEVERAGE",
                              imageUrl:
                                "https://cdn.example.com/products/pocari.png",
                              price: 25000,
                              unit: "VND / bottle",
                              stock: 100,
                              isActive: true,
                              createdAt: "2026-05-20T10:00:00.000Z",
                              updatedAt: "2026-05-20T10:00:00.000Z",
                            },
                          },
                        ],
                        items: [
                          {
                            courtId: "f21ddb56-dd63-4e92-9b01-e3bc6784b972",
                            courtName: "San 1",
                            startTime: "17:00",
                            endTime: "19:00",
                            durationHours: 2,
                            breakdown: [
                              {
                                startTime: "17:00",
                                endTime: "17:30",
                                pricePerHour: 120000,
                              },
                              {
                                startTime: "17:30",
                                endTime: "18:00",
                                pricePerHour: 120000,
                              },
                              {
                                startTime: "18:00",
                                endTime: "18:30",
                                pricePerHour: 120000,
                              },
                              {
                                startTime: "18:30",
                                endTime: "19:00",
                                pricePerHour: 120000,
                              },
                            ],
                            courtPrice: 240000,
                          },
                          {
                            courtId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                            courtName: "San 2",
                            startTime: "19:00",
                            endTime: "21:00",
                            durationHours: 2,
                            breakdown: [
                              {
                                startTime: "19:00",
                                endTime: "19:30",
                                pricePerHour: 120000,
                              },
                              {
                                startTime: "19:30",
                                endTime: "20:00",
                                pricePerHour: 120000,
                              },
                              {
                                startTime: "20:00",
                                endTime: "20:30",
                                pricePerHour: 120000,
                              },
                              {
                                startTime: "20:30",
                                endTime: "21:00",
                                pricePerHour: 120000,
                              },
                            ],
                            courtPrice: 240000,
                          },
                        ],
                        bookingCount: 2,
                        totalCourtPrice: 480000,
                        totalServicePrice: 50000,
                        totalProductPrice: 100000,
                        services: [
                          {
                            id: "550e8400-e29b-41d4-a716-446655440001",
                            name: "Racket Rental",
                            price: 25000,
                            unit: "VND / 3h",
                            quantity: 1,
                            lineTotal: 25000,
                          },
                        ],
                        products: [
                          {
                            id: "550e8400-e29b-41d4-a716-446655440010",
                            name: "Pocari Sweat 500ml",
                            price: 25000,
                            unit: "VND / bottle",
                            stock: 100,
                            quantity: 2,
                            lineTotal: 50000,
                          },
                        ],
                        servicePricePerItem: 25000,
                        productPricePerItem: 50000,
                      },
                    },
                  },
                },
              },
              400: {
                description: "Invalid time range or outside operating hours.",
              },
              403: {
                description: "Caller is not the owner of the sport center.",
              },
              404: {
                description: "Court not found or inactive.",
              },
            },
            security: [
              {
                "access-token": [],
              },
            ],
            summary:
              "Create one or more court bookings for a player (owner action)",
            tags: ["Bookings"],
          },
        },
        "/api/sport-centers/{centerId}/bookings/{bookingId}": {
          get: {
            description:
              "Owner can get full details of a specific booking at their center.",
            operationId: "BookingController_getCenterBookingDetail",
            parameters: [
              {
                name: "centerId",
                required: true,
                in: "path",
                schema: {
                  type: "string",
                },
              },
              {
                name: "bookingId",
                required: true,
                in: "path",
                schema: {
                  type: "string",
                },
              },
            ],
            responses: {
              200: {
                description: "Booking fetched successfully.",
                content: {
                  "application/json": {
                    schema: {
                      example: {
                        id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                        centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                        playerId: "user-uuid-1234",
                        playerName: "John Doe",
                        phoneNumber: "+66 81 234 5678",
                        date: "2026-05-15T00:00:00.000Z",
                        status: "PENDING",
                        totalPrice: 630000,
                        creditApplied: 0,
                        paymentRemaining: 315000,
                        note: "Need extra balls",
                        playSessionId: null,
                        paymentProofUrl: null,
                        paymentProofUploadedAt: null,
                        expiresAt: "2026-05-06T08:10:00.000Z",
                        bookingTimeoutMinutes: 10,
                        createdAt: "2026-05-06T08:00:00.000Z",
                        updatedAt: "2026-05-06T08:00:00.000Z",
                        cancelledAt: null,
                        cancelReason: null,
                        center: {
                          id: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                          ownerId: "owner-uuid-5678",
                          name: "Pickle Dome Sukhumvit",
                          address: "42 Sukhumvit 49, Watthana, Bangkok",
                          phone: "+66 2 111 2222",
                          email: "hello@pickledome.com",
                          openTime: "06:00",
                          closeTime: "23:00",
                          basePrice: 80000,
                          status: "ACTIVE",
                          amenities: ["Parking", "Shower"],
                          images: [],
                          rules: ["Non-marking shoes only"],
                          description: "Pickle Dome Sukhumvit",
                          paymentAccountName: "NGUYEN VAN AN",
                          paymentAccountNumber: "1234567890",
                          paymentBankName: "VietcomBank",
                          paymentQrUrl:
                            "https://cdn.example.com/qr/sample-qr.png",
                          createdAt: "2026-05-06T08:00:00.000Z",
                          updatedAt: "2026-05-06T08:00:00.000Z",
                          deletedAt: null,
                        },
                        bookingItems: [
                          {
                            id: "i1111111-2222-3333-4444-555555555551",
                            bookingId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                            courtId: "f21ddb56-dd63-4e92-9b01-e3bc6784b972",
                            startTime: "17:00",
                            endTime: "19:00",
                            itemPrice: 240000,
                            createdAt: "2026-05-06T08:00:00.000Z",
                            court: {
                              id: "f21ddb56-dd63-4e92-9b01-e3bc6784b972",
                              centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                              name: "San 1",
                              type: "INDOOR",
                              status: "ACTIVE",
                              createdAt: "2026-05-06T08:00:00.000Z",
                              updatedAt: "2026-05-06T08:00:00.000Z",
                            },
                          },
                          {
                            id: "i1111111-2222-3333-4444-555555555552",
                            bookingId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                            courtId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                            startTime: "19:00",
                            endTime: "21:00",
                            itemPrice: 240000,
                            createdAt: "2026-05-06T08:00:00.000Z",
                            court: {
                              id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                              centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                              name: "San 2",
                              type: "INDOOR",
                              status: "ACTIVE",
                              createdAt: "2026-05-06T08:00:00.000Z",
                              updatedAt: "2026-05-06T08:00:00.000Z",
                            },
                          },
                        ],
                        bookingServices: [
                          {
                            id: "c1111111-2222-3333-4444-555555555551",
                            bookingId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                            serviceId: "550e8400-e29b-41d4-a716-446655440001",
                            quantity: 1,
                            price: 25000,
                            createdAt: "2026-05-20T10:00:00.000Z",
                            service: {
                              id: "550e8400-e29b-41d4-a716-446655440001",
                              centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                              name: "Racket Rental",
                              description:
                                "Rent a professional pickleball racket",
                              type: "EQUIPMENT_RENTAL",
                              imageUrl:
                                "https://cdn.example.com/services/racket-rental.png",
                              price: 25000,
                              unit: "VND / 3h",
                              isActive: true,
                              createdAt: "2026-05-20T10:00:00.000Z",
                              updatedAt: "2026-05-20T10:00:00.000Z",
                            },
                          },
                        ],
                        bookingProducts: [
                          {
                            id: "c1111111-2222-3333-4444-555555555552",
                            bookingId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                            productId: "550e8400-e29b-41d4-a716-446655440010",
                            quantity: 2,
                            price: 25000,
                            createdAt: "2026-05-20T10:00:00.000Z",
                            product: {
                              id: "550e8400-e29b-41d4-a716-446655440010",
                              centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                              name: "Pocari Sweat 500ml",
                              description: "Refreshing sports drink",
                              type: "BEVERAGE",
                              imageUrl:
                                "https://cdn.example.com/products/pocari.png",
                              price: 25000,
                              unit: "VND / bottle",
                              stock: 100,
                              isActive: true,
                              createdAt: "2026-05-20T10:00:00.000Z",
                              updatedAt: "2026-05-20T10:00:00.000Z",
                            },
                          },
                        ],
                        items: [
                          {
                            courtId: "f21ddb56-dd63-4e92-9b01-e3bc6784b972",
                            courtName: "San 1",
                            startTime: "17:00",
                            endTime: "19:00",
                            durationHours: 2,
                            breakdown: [
                              {
                                startTime: "17:00",
                                endTime: "17:30",
                                pricePerHour: 120000,
                              },
                              {
                                startTime: "17:30",
                                endTime: "18:00",
                                pricePerHour: 120000,
                              },
                              {
                                startTime: "18:00",
                                endTime: "18:30",
                                pricePerHour: 120000,
                              },
                              {
                                startTime: "18:30",
                                endTime: "19:00",
                                pricePerHour: 120000,
                              },
                            ],
                            courtPrice: 240000,
                          },
                          {
                            courtId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                            courtName: "San 2",
                            startTime: "19:00",
                            endTime: "21:00",
                            durationHours: 2,
                            breakdown: [
                              {
                                startTime: "19:00",
                                endTime: "19:30",
                                pricePerHour: 120000,
                              },
                              {
                                startTime: "19:30",
                                endTime: "20:00",
                                pricePerHour: 120000,
                              },
                              {
                                startTime: "20:00",
                                endTime: "20:30",
                                pricePerHour: 120000,
                              },
                              {
                                startTime: "20:30",
                                endTime: "21:00",
                                pricePerHour: 120000,
                              },
                            ],
                            courtPrice: 240000,
                          },
                        ],
                        bookingCount: 2,
                        totalCourtPrice: 480000,
                        totalServicePrice: 50000,
                        totalProductPrice: 100000,
                        services: [
                          {
                            id: "550e8400-e29b-41d4-a716-446655440001",
                            name: "Racket Rental",
                            price: 25000,
                            unit: "VND / 3h",
                            quantity: 1,
                            lineTotal: 25000,
                          },
                        ],
                        products: [
                          {
                            id: "550e8400-e29b-41d4-a716-446655440010",
                            name: "Pocari Sweat 500ml",
                            price: 25000,
                            unit: "VND / bottle",
                            stock: 100,
                            quantity: 2,
                            lineTotal: 50000,
                          },
                        ],
                        servicePricePerItem: 25000,
                        productPricePerItem: 50000,
                        court: {
                          id: "f21ddb56-dd63-4e92-9b01-e3bc6784b972",
                          centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                          name: "San 1",
                          type: "INDOOR",
                          status: "ACTIVE",
                          createdAt: "2026-05-06T08:00:00.000Z",
                          updatedAt: "2026-05-06T08:00:00.000Z",
                          center: {
                            id: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                            ownerId: "owner-uuid-5678",
                            name: "Pickle Dome Sukhumvit",
                          },
                        },
                        player: {
                          id: "user-uuid-1234",
                          name: "Sarah Johnson",
                          email: "sarah@example.com",
                          avatarUrl: "https://example.com/avatar.jpg",
                        },
                      },
                    },
                  },
                },
              },
              403: {
                description: "Caller is not the owner of the sport center.",
              },
              404: {
                description: "Booking or sport center not found.",
              },
            },
            security: [
              {
                "access-token": [],
              },
            ],
            summary: "Get single booking detail (owner action)",
            tags: ["Bookings"],
          },
        },
        "/api/bookings/{bookingId}/confirm": {
          patch: {
            description:
              "Owner confirms a PENDING booking. A notification is sent to the player.",
            operationId: "BookingController_confirmBooking",
            parameters: [
              {
                name: "bookingId",
                required: true,
                in: "path",
                schema: {
                  type: "string",
                },
              },
            ],
            responses: {
              200: {
                description: "Booking confirmed successfully.",
                content: {
                  "application/json": {
                    schema: {
                      example: {
                        id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                        centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                        playerId: "user-uuid-1234",
                        playerName: "John Doe",
                        phoneNumber: "+66 81 234 5678",
                        date: "2026-05-15T00:00:00.000Z",
                        status: "CONFIRMED",
                        totalPrice: 630000,
                        creditApplied: 0,
                        paymentRemaining: 315000,
                        note: "Need extra balls",
                        playSessionId: null,
                        paymentProofUrl: null,
                        paymentProofUploadedAt: null,
                        expiresAt: "2026-05-06T08:10:00.000Z",
                        bookingTimeoutMinutes: 10,
                        createdAt: "2026-05-06T08:00:00.000Z",
                        updatedAt: "2026-05-06T08:05:00.000Z",
                        cancelledAt: null,
                        cancelReason: null,
                        center: {
                          id: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                          ownerId: "owner-uuid-5678",
                          name: "Pickle Dome Sukhumvit",
                          address: "42 Sukhumvit 49, Watthana, Bangkok",
                          phone: "+66 2 111 2222",
                          email: "hello@pickledome.com",
                          openTime: "06:00",
                          closeTime: "23:00",
                          basePrice: 80000,
                          status: "ACTIVE",
                          amenities: ["Parking", "Shower"],
                          images: [],
                          rules: ["Non-marking shoes only"],
                          description: "Pickle Dome Sukhumvit",
                          paymentAccountName: "NGUYEN VAN AN",
                          paymentAccountNumber: "1234567890",
                          paymentBankName: "VietcomBank",
                          paymentQrUrl:
                            "https://cdn.example.com/qr/sample-qr.png",
                          createdAt: "2026-05-06T08:00:00.000Z",
                          updatedAt: "2026-05-06T08:00:00.000Z",
                          deletedAt: null,
                        },
                        bookingItems: [
                          {
                            id: "i1111111-2222-3333-4444-555555555551",
                            bookingId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                            courtId: "f21ddb56-dd63-4e92-9b01-e3bc6784b972",
                            startTime: "17:00",
                            endTime: "19:00",
                            itemPrice: 240000,
                            createdAt: "2026-05-06T08:00:00.000Z",
                            court: {
                              id: "f21ddb56-dd63-4e92-9b01-e3bc6784b972",
                              centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                              name: "San 1",
                              type: "INDOOR",
                              status: "ACTIVE",
                              createdAt: "2026-05-06T08:00:00.000Z",
                              updatedAt: "2026-05-06T08:00:00.000Z",
                            },
                          },
                          {
                            id: "i1111111-2222-3333-4444-555555555552",
                            bookingId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                            courtId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                            startTime: "19:00",
                            endTime: "21:00",
                            itemPrice: 240000,
                            createdAt: "2026-05-06T08:00:00.000Z",
                            court: {
                              id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                              centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                              name: "San 2",
                              type: "INDOOR",
                              status: "ACTIVE",
                              createdAt: "2026-05-06T08:00:00.000Z",
                              updatedAt: "2026-05-06T08:00:00.000Z",
                            },
                          },
                        ],
                        bookingServices: [
                          {
                            id: "c1111111-2222-3333-4444-555555555551",
                            bookingId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                            serviceId: "550e8400-e29b-41d4-a716-446655440001",
                            quantity: 1,
                            price: 25000,
                            createdAt: "2026-05-20T10:00:00.000Z",
                            service: {
                              id: "550e8400-e29b-41d4-a716-446655440001",
                              centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                              name: "Racket Rental",
                              description:
                                "Rent a professional pickleball racket",
                              type: "EQUIPMENT_RENTAL",
                              imageUrl:
                                "https://cdn.example.com/services/racket-rental.png",
                              price: 25000,
                              unit: "VND / 3h",
                              isActive: true,
                              createdAt: "2026-05-20T10:00:00.000Z",
                              updatedAt: "2026-05-20T10:00:00.000Z",
                            },
                          },
                        ],
                        bookingProducts: [
                          {
                            id: "c1111111-2222-3333-4444-555555555552",
                            bookingId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                            productId: "550e8400-e29b-41d4-a716-446655440010",
                            quantity: 2,
                            price: 25000,
                            createdAt: "2026-05-20T10:00:00.000Z",
                            product: {
                              id: "550e8400-e29b-41d4-a716-446655440010",
                              centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                              name: "Pocari Sweat 500ml",
                              description: "Refreshing sports drink",
                              type: "BEVERAGE",
                              imageUrl:
                                "https://cdn.example.com/products/pocari.png",
                              price: 25000,
                              unit: "VND / bottle",
                              stock: 100,
                              isActive: true,
                              createdAt: "2026-05-20T10:00:00.000Z",
                              updatedAt: "2026-05-20T10:00:00.000Z",
                            },
                          },
                        ],
                        items: [
                          {
                            courtId: "f21ddb56-dd63-4e92-9b01-e3bc6784b972",
                            courtName: "San 1",
                            startTime: "17:00",
                            endTime: "19:00",
                            durationHours: 2,
                            breakdown: [
                              {
                                startTime: "17:00",
                                endTime: "17:30",
                                pricePerHour: 120000,
                              },
                              {
                                startTime: "17:30",
                                endTime: "18:00",
                                pricePerHour: 120000,
                              },
                              {
                                startTime: "18:00",
                                endTime: "18:30",
                                pricePerHour: 120000,
                              },
                              {
                                startTime: "18:30",
                                endTime: "19:00",
                                pricePerHour: 120000,
                              },
                            ],
                            courtPrice: 240000,
                          },
                          {
                            courtId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                            courtName: "San 2",
                            startTime: "19:00",
                            endTime: "21:00",
                            durationHours: 2,
                            breakdown: [
                              {
                                startTime: "19:00",
                                endTime: "19:30",
                                pricePerHour: 120000,
                              },
                              {
                                startTime: "19:30",
                                endTime: "20:00",
                                pricePerHour: 120000,
                              },
                              {
                                startTime: "20:00",
                                endTime: "20:30",
                                pricePerHour: 120000,
                              },
                              {
                                startTime: "20:30",
                                endTime: "21:00",
                                pricePerHour: 120000,
                              },
                            ],
                            courtPrice: 240000,
                          },
                        ],
                        bookingCount: 2,
                        totalCourtPrice: 480000,
                        totalServicePrice: 50000,
                        totalProductPrice: 100000,
                        services: [
                          {
                            id: "550e8400-e29b-41d4-a716-446655440001",
                            name: "Racket Rental",
                            price: 25000,
                            unit: "VND / 3h",
                            quantity: 1,
                            lineTotal: 25000,
                          },
                        ],
                        products: [
                          {
                            id: "550e8400-e29b-41d4-a716-446655440010",
                            name: "Pocari Sweat 500ml",
                            price: 25000,
                            unit: "VND / bottle",
                            stock: 100,
                            quantity: 2,
                            lineTotal: 50000,
                          },
                        ],
                        servicePricePerItem: 25000,
                        productPricePerItem: 50000,
                      },
                    },
                  },
                },
              },
              400: {
                description: "Booking is not in PENDING status.",
              },
              403: {
                description: "Caller is not the owner of the sport center.",
              },
              404: {
                description: "Booking not found.",
              },
            },
            security: [
              {
                "access-token": [],
              },
            ],
            summary: "Confirm a booking (owner action)",
            tags: ["Bookings"],
          },
        },
        "/api/bookings/{bookingId}/complete": {
          patch: {
            description: "Owner marks a CONFIRMED booking as COMPLETED.",
            operationId: "BookingController_completeBooking",
            parameters: [
              {
                name: "bookingId",
                required: true,
                in: "path",
                schema: {
                  type: "string",
                },
              },
            ],
            responses: {
              200: {
                description: "Booking completed successfully.",
                content: {
                  "application/json": {
                    schema: {
                      example: {
                        id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                        centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                        playerId: "user-uuid-1234",
                        playerName: "John Doe",
                        phoneNumber: "+66 81 234 5678",
                        date: "2026-05-15T00:00:00.000Z",
                        status: "COMPLETED",
                        totalPrice: 630000,
                        creditApplied: 0,
                        paymentRemaining: 315000,
                        note: "Need extra balls",
                        playSessionId: null,
                        paymentProofUrl: null,
                        paymentProofUploadedAt: null,
                        expiresAt: "2026-05-06T08:10:00.000Z",
                        bookingTimeoutMinutes: 10,
                        createdAt: "2026-05-06T08:00:00.000Z",
                        updatedAt: "2026-05-06T19:00:00.000Z",
                        cancelledAt: null,
                        cancelReason: null,
                        center: {
                          id: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                          ownerId: "owner-uuid-5678",
                          name: "Pickle Dome Sukhumvit",
                          address: "42 Sukhumvit 49, Watthana, Bangkok",
                          phone: "+66 2 111 2222",
                          email: "hello@pickledome.com",
                          openTime: "06:00",
                          closeTime: "23:00",
                          basePrice: 80000,
                          status: "ACTIVE",
                          amenities: ["Parking", "Shower"],
                          images: [],
                          rules: ["Non-marking shoes only"],
                          description: "Pickle Dome Sukhumvit",
                          paymentAccountName: "NGUYEN VAN AN",
                          paymentAccountNumber: "1234567890",
                          paymentBankName: "VietcomBank",
                          paymentQrUrl:
                            "https://cdn.example.com/qr/sample-qr.png",
                          createdAt: "2026-05-06T08:00:00.000Z",
                          updatedAt: "2026-05-06T08:00:00.000Z",
                          deletedAt: null,
                        },
                        bookingItems: [
                          {
                            id: "i1111111-2222-3333-4444-555555555551",
                            bookingId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                            courtId: "f21ddb56-dd63-4e92-9b01-e3bc6784b972",
                            startTime: "17:00",
                            endTime: "19:00",
                            itemPrice: 240000,
                            createdAt: "2026-05-06T08:00:00.000Z",
                            court: {
                              id: "f21ddb56-dd63-4e92-9b01-e3bc6784b972",
                              centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                              name: "San 1",
                              type: "INDOOR",
                              status: "ACTIVE",
                              createdAt: "2026-05-06T08:00:00.000Z",
                              updatedAt: "2026-05-06T08:00:00.000Z",
                            },
                          },
                          {
                            id: "i1111111-2222-3333-4444-555555555552",
                            bookingId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                            courtId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                            startTime: "19:00",
                            endTime: "21:00",
                            itemPrice: 240000,
                            createdAt: "2026-05-06T08:00:00.000Z",
                            court: {
                              id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                              centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                              name: "San 2",
                              type: "INDOOR",
                              status: "ACTIVE",
                              createdAt: "2026-05-06T08:00:00.000Z",
                              updatedAt: "2026-05-06T08:00:00.000Z",
                            },
                          },
                        ],
                        bookingServices: [
                          {
                            id: "c1111111-2222-3333-4444-555555555551",
                            bookingId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                            serviceId: "550e8400-e29b-41d4-a716-446655440001",
                            quantity: 1,
                            price: 25000,
                            createdAt: "2026-05-20T10:00:00.000Z",
                            service: {
                              id: "550e8400-e29b-41d4-a716-446655440001",
                              centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                              name: "Racket Rental",
                              description:
                                "Rent a professional pickleball racket",
                              type: "EQUIPMENT_RENTAL",
                              imageUrl:
                                "https://cdn.example.com/services/racket-rental.png",
                              price: 25000,
                              unit: "VND / 3h",
                              isActive: true,
                              createdAt: "2026-05-20T10:00:00.000Z",
                              updatedAt: "2026-05-20T10:00:00.000Z",
                            },
                          },
                        ],
                        bookingProducts: [
                          {
                            id: "c1111111-2222-3333-4444-555555555552",
                            bookingId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                            productId: "550e8400-e29b-41d4-a716-446655440010",
                            quantity: 2,
                            price: 25000,
                            createdAt: "2026-05-20T10:00:00.000Z",
                            product: {
                              id: "550e8400-e29b-41d4-a716-446655440010",
                              centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                              name: "Pocari Sweat 500ml",
                              description: "Refreshing sports drink",
                              type: "BEVERAGE",
                              imageUrl:
                                "https://cdn.example.com/products/pocari.png",
                              price: 25000,
                              unit: "VND / bottle",
                              stock: 100,
                              isActive: true,
                              createdAt: "2026-05-20T10:00:00.000Z",
                              updatedAt: "2026-05-20T10:00:00.000Z",
                            },
                          },
                        ],
                        items: [
                          {
                            courtId: "f21ddb56-dd63-4e92-9b01-e3bc6784b972",
                            courtName: "San 1",
                            startTime: "17:00",
                            endTime: "19:00",
                            durationHours: 2,
                            breakdown: [
                              {
                                startTime: "17:00",
                                endTime: "17:30",
                                pricePerHour: 120000,
                              },
                              {
                                startTime: "17:30",
                                endTime: "18:00",
                                pricePerHour: 120000,
                              },
                              {
                                startTime: "18:00",
                                endTime: "18:30",
                                pricePerHour: 120000,
                              },
                              {
                                startTime: "18:30",
                                endTime: "19:00",
                                pricePerHour: 120000,
                              },
                            ],
                            courtPrice: 240000,
                          },
                          {
                            courtId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                            courtName: "San 2",
                            startTime: "19:00",
                            endTime: "21:00",
                            durationHours: 2,
                            breakdown: [
                              {
                                startTime: "19:00",
                                endTime: "19:30",
                                pricePerHour: 120000,
                              },
                              {
                                startTime: "19:30",
                                endTime: "20:00",
                                pricePerHour: 120000,
                              },
                              {
                                startTime: "20:00",
                                endTime: "20:30",
                                pricePerHour: 120000,
                              },
                              {
                                startTime: "20:30",
                                endTime: "21:00",
                                pricePerHour: 120000,
                              },
                            ],
                            courtPrice: 240000,
                          },
                        ],
                        bookingCount: 2,
                        totalCourtPrice: 480000,
                        totalServicePrice: 50000,
                        totalProductPrice: 100000,
                        services: [
                          {
                            id: "550e8400-e29b-41d4-a716-446655440001",
                            name: "Racket Rental",
                            price: 25000,
                            unit: "VND / 3h",
                            quantity: 1,
                            lineTotal: 25000,
                          },
                        ],
                        products: [
                          {
                            id: "550e8400-e29b-41d4-a716-446655440010",
                            name: "Pocari Sweat 500ml",
                            price: 25000,
                            unit: "VND / bottle",
                            stock: 100,
                            quantity: 2,
                            lineTotal: 50000,
                          },
                        ],
                        servicePricePerItem: 25000,
                        productPricePerItem: 50000,
                      },
                    },
                  },
                },
              },
              400: {
                description: "Booking is not in CONFIRMED status.",
              },
              403: {
                description: "Caller is not the owner of the sport center.",
              },
              404: {
                description: "Booking not found.",
              },
            },
            security: [
              {
                "access-token": [],
              },
            ],
            summary: "Complete a booking (owner action)",
            tags: ["Bookings"],
          },
        },
        "/api/bookings/batch": {
          post: {
            description: "Fetch booking details for a list of booking IDs.",
            operationId: "BookingController_getBookingBatch",
            parameters: [],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/BatchBookingsDto",
                  },
                },
              },
            },
            responses: {
              200: {
                description: "Booking infos fetched successfully.",
                content: {
                  "application/json": {
                    schema: {
                      example: {
                        bookingInfos: [
                          {
                            id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                            date: "2026-05-15T00:00:00.000Z",
                            status: "CONFIRMED",
                            totalPrice: 280000,
                            center: {
                              id: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                              name: "Pickle Dome Sukhumvit",
                              address: "42 Sukhumvit 49, Bangkok",
                            },
                            bookingItems: [
                              {
                                id: "c1d2e3f4-a5b6-7c8d-9e0f-1a2b3c4d5e6f",
                                courtId: "f21ddb56-dd63-4e92-9b01-e3bc6784b972",
                                startTime: "17:00",
                                endTime: "19:00",
                                court: {
                                  id: "f21ddb56-dd63-4e92-9b01-e3bc6784b972",
                                  name: "San 1",
                                },
                              },
                              {
                                id: "d2e3f4a5-b6c7-8d9e-0f1a-2b3c4d5e6f7a",
                                courtId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                                startTime: "17:00",
                                endTime: "19:00",
                                court: {
                                  id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                                  name: "San 2",
                                },
                              },
                            ],
                          },
                          {
                            id: "b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e",
                            date: "2026-05-15T00:00:00.000Z",
                            status: "CONFIRMED",
                            totalPrice: 140000,
                            center: {
                              id: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                              name: "Pickle Dome Sukhumvit",
                              address: "42 Sukhumvit 49, Bangkok",
                            },
                            bookingItems: [
                              {
                                id: "e3f4a5b6-c7d8-9e0f-1a2b-3c4d5e6f7a8b",
                                courtId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                                startTime: "19:00",
                                endTime: "21:00",
                                court: {
                                  id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                                  name: "San 2",
                                },
                              },
                            ],
                          },
                        ],
                      },
                    },
                  },
                },
              },
            },
            security: [
              {
                "internal-service-token": [],
              },
            ],
            summary: "Get booking info batch (internal)",
            tags: ["Bookings"],
          },
        },
        "/api/bookings/link-play-session": {
          post: {
            description: "Sets playSessionId for multiple bookings.",
            operationId: "BookingController_linkPlaySession",
            parameters: [],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/LinkPlaySessionDto",
                  },
                },
              },
            },
            responses: {
              200: {
                description: "Bookings linked successfully.",
                content: {
                  "application/json": {
                    schema: {
                      example: {
                        message: "Bookings linked successfully",
                        data: {
                          updatedCount: 2,
                        },
                      },
                    },
                  },
                },
              },
            },
            security: [
              {
                "internal-service-token": [],
              },
            ],
            summary: "Link bookings to play session (internal)",
            tags: ["Bookings"],
          },
        },
        "/api/bookings/unlink-play-session": {
          post: {
            description: "Clears playSessionId for multiple bookings.",
            operationId: "BookingController_unlinkPlaySession",
            parameters: [],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/UnlinkPlaySessionDto",
                  },
                },
              },
            },
            responses: {
              200: {
                description: "Bookings unlinked successfully.",
                content: {
                  "application/json": {
                    schema: {
                      example: {
                        message: "Bookings unlinked successfully",
                        data: {
                          updatedCount: 2,
                        },
                      },
                    },
                  },
                },
              },
            },
            security: [
              {
                "internal-service-token": [],
              },
            ],
            summary: "Unlink bookings from play session (internal)",
            tags: ["Bookings"],
          },
        },
        "/api/bookings/internal/query-by-player": {
          post: {
            description:
              "Retrieves non-cancelled bookings of a player within date range.",
            operationId: "BookingController_queryPlayerBookingsInternal",
            parameters: [],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/QueryPlayerBookingsDto",
                  },
                },
              },
            },
            responses: {
              201: {
                description: "",
              },
            },
            security: [
              {
                "internal-service-token": [],
              },
            ],
            summary: "Query bookings by player (internal)",
            tags: ["Bookings"],
          },
        },
        "/api/bookings/internal/{bookingId}/cancellation-policy": {
          get: {
            description:
              "Calculates refund eligibility and builds user warnings.",
            operationId: "BookingController_getCancellationPolicyInternal",
            parameters: [
              {
                name: "bookingId",
                required: true,
                in: "path",
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
            security: [
              {
                "internal-service-token": [],
              },
            ],
            summary: "Query booking cancellation policy eligibility (internal)",
            tags: ["Bookings"],
          },
        },
        "/api/bookings/internal/{bookingId}/cancel": {
          post: {
            description: "Cancels the booking bypassing user token checks.",
            operationId: "BookingController_cancelBookingInternal",
            parameters: [
              {
                name: "bookingId",
                required: true,
                in: "path",
                schema: {
                  type: "string",
                },
              },
            ],
            responses: {
              201: {
                description: "",
              },
            },
            security: [
              {
                "internal-service-token": [],
              },
            ],
            summary: "Cancel booking internally (internal)",
            tags: ["Bookings"],
          },
        },
        "/api/sport-centers/internal/bookings/batch": {
          post: {
            operationId: "BookingInternalController_getBatchBookings",
            parameters: [],
            responses: {
              201: {
                description: "",
              },
            },
            security: [
              {
                "internal-service-token": [],
              },
            ],
            tags: ["internal"],
          },
        },
        "/api/sport-centers/revenue/summary": {
          get: {
            description:
              "Returns settled revenue and outstanding payment queues across all owned centers, optionally filtered by centerId and date range.",
            operationId: "RevenueController_getRevenueSummary",
            parameters: [
              {
                name: "centerId",
                required: false,
                in: "query",
                description: "Filter by sport center ID",
                schema: {
                  type: "string",
                },
              },
              {
                name: "from",
                required: false,
                in: "query",
                description: "Start date (YYYY-MM-DD)",
                schema: {
                  type: "string",
                },
              },
              {
                name: "to",
                required: false,
                in: "query",
                description: "End date (YYYY-MM-DD)",
                schema: {
                  type: "string",
                },
              },
              {
                name: "status",
                required: false,
                in: "query",
                schema: {
                  type: "string",
                  enum: ["PENDING_REVIEW", "SETTLED", "REJECTED", "VOIDED"],
                },
              },
              {
                name: "method",
                required: false,
                in: "query",
                schema: {
                  type: "string",
                  enum: ["BANK_TRANSFER", "CASH"],
                },
              },
              {
                name: "limit",
                required: false,
                in: "query",
                schema: {
                  default: 20,
                  type: "number",
                },
              },
              {
                name: "offset",
                required: false,
                in: "query",
                schema: {
                  default: 0,
                  type: "number",
                },
              },
            ],
            responses: {
              200: {
                description: "Revenue summary fetched successfully.",
                content: {
                  "application/json": {
                    schema: {
                      example: {
                        centerId: null,
                        period: {
                          from: "2026-05-01",
                          to: "2026-05-31",
                        },
                        totalSettledRevenue: 1845000,
                        totalPendingRevenue: 315000,
                        settledTransactionCount: 12,
                        pendingTransactionCount: 3,
                        byCenter: [
                          {
                            centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                            centerName: "Pickle Dome Sukhumvit",
                            settledRevenue: 1250000,
                            pendingRevenue: 120000,
                            settledTransactionCount: 8,
                            pendingTransactionCount: 1,
                          },
                        ],
                      },
                    },
                  },
                },
              },
            },
            security: [
              {
                "access-token": [],
              },
            ],
            summary: "Get owner revenue summary",
            tags: ["Revenue"],
          },
        },
        "/api/sport-centers/revenue/transactions": {
          get: {
            description:
              "Lists payment transactions across all owned centers, optionally filtered by center, status, method, and date range.",
            operationId: "RevenueController_getTransactions",
            parameters: [
              {
                name: "centerId",
                required: false,
                in: "query",
                description: "Filter by sport center ID",
                schema: {
                  type: "string",
                },
              },
              {
                name: "from",
                required: false,
                in: "query",
                description: "Start date (YYYY-MM-DD)",
                schema: {
                  type: "string",
                },
              },
              {
                name: "to",
                required: false,
                in: "query",
                description: "End date (YYYY-MM-DD)",
                schema: {
                  type: "string",
                },
              },
              {
                name: "status",
                required: false,
                in: "query",
                schema: {
                  type: "string",
                  enum: ["PENDING_REVIEW", "SETTLED", "REJECTED", "VOIDED"],
                },
              },
              {
                name: "method",
                required: false,
                in: "query",
                schema: {
                  type: "string",
                  enum: ["BANK_TRANSFER", "CASH"],
                },
              },
              {
                name: "limit",
                required: false,
                in: "query",
                schema: {
                  default: 20,
                  type: "number",
                },
              },
              {
                name: "offset",
                required: false,
                in: "query",
                schema: {
                  default: 0,
                  type: "number",
                },
              },
            ],
            responses: {
              200: {
                description: "Payment transactions fetched successfully.",
                content: {
                  "application/json": {
                    schema: {
                      example: {
                        data: [
                          {
                            id: "ptx-uuid-1",
                            bookingId: "booking-uuid-1",
                            centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                            playerId: "user-uuid-1234",
                            amount: 315000,
                            method: "BANK_TRANSFER",
                            status: "PENDING_REVIEW",
                            proofUrl:
                              "https://cdn.example.com/proofs/transfer-receipt.jpg",
                            receivedAt: null,
                            reviewedAt: null,
                            rejectedAt: null,
                            rejectedReason: null,
                            createdAt: "2026-05-06T08:03:00.000Z",
                            updatedAt: "2026-05-06T08:03:00.000Z",
                            center: {
                              id: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                              name: "Pickle Dome Sukhumvit",
                            },
                            booking: {
                              id: "booking-uuid-1",
                              date: "2026-05-06T00:00:00.000Z",
                              status: "PENDING",
                              totalPrice: 315000,
                              creditApplied: 0,
                              paymentRemaining: 315000,
                              paymentProofUrl:
                                "https://cdn.example.com/proofs/transfer-receipt.jpg",
                              paymentProofUploadedAt:
                                "2026-05-06T08:03:00.000Z",
                            },
                          },
                        ],
                        pagination: {
                          limit: 20,
                          offset: 0,
                          total: 1,
                        },
                      },
                    },
                  },
                },
              },
            },
            security: [
              {
                "access-token": [],
              },
            ],
            summary: "List owner payment transactions",
            tags: ["Revenue"],
          },
        },
        "/api/sport-centers/revenue/statistics": {
          get: {
            description:
              "Returns a read-only revenue dashboard that combines cash collections with gross court, service, and product revenue breakdowns across owned centers.",
            operationId: "RevenueController_getRevenueStatistics",
            parameters: [
              {
                name: "centerId",
                required: false,
                in: "query",
                description: "Filter by sport center ID",
                schema: {
                  type: "string",
                },
              },
              {
                name: "from",
                required: false,
                in: "query",
                description: "Start date (YYYY-MM-DD)",
                schema: {
                  type: "string",
                },
              },
              {
                name: "to",
                required: false,
                in: "query",
                description: "End date (YYYY-MM-DD)",
                schema: {
                  type: "string",
                },
              },
            ],
            responses: {
              200: {
                description: "Revenue statistics fetched successfully.",
                content: {
                  "application/json": {
                    schema: {
                      example: {
                        centerId: null,
                        period: {
                          from: "2026-05-01",
                          to: "2026-05-31",
                        },
                        cashRevenue: {
                          centerId: null,
                          period: {
                            from: "2026-05-01",
                            to: "2026-05-31",
                          },
                          totalSettledRevenue: 1845000,
                          totalPendingRevenue: 315000,
                          settledTransactionCount: 12,
                          pendingTransactionCount: 3,
                          byCenter: [
                            {
                              centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                              centerName: "Pickle Dome Sukhumvit",
                              settledRevenue: 1250000,
                              pendingRevenue: 120000,
                              settledTransactionCount: 8,
                              pendingTransactionCount: 1,
                            },
                          ],
                        },
                        grossRevenue: {
                          totalCourtRevenue: 2160000,
                          totalServiceRevenue: 420000,
                          totalProductRevenue: 175000,
                          totalRevenue: 2755000,
                          bookingCount: 18,
                          serviceLineCount: 14,
                          productLineCount: 9,
                          byCenter: [
                            {
                              centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                              centerName: "Pickle Dome Sukhumvit",
                              courtRevenue: 1460000,
                              serviceRevenue: 240000,
                              productRevenue: 85000,
                              grossRevenue: 1785000,
                              bookingCount: 10,
                              serviceLineCount: 8,
                              productLineCount: 4,
                            },
                          ],
                        },
                      },
                    },
                  },
                },
              },
            },
            security: [
              {
                "access-token": [],
              },
            ],
            summary: "Get owner revenue statistics",
            tags: ["Revenue"],
          },
        },
        "/api/sport-centers/revenue/statistics/daily": {
          get: {
            description:
              "Returns a day-by-day read-only revenue dashboard including court, service, product, and cash collections for charting.",
            operationId: "RevenueController_getRevenueDailyStatistics",
            parameters: [
              {
                name: "centerId",
                required: false,
                in: "query",
                description: "Filter by sport center ID",
                schema: {
                  type: "string",
                },
              },
              {
                name: "from",
                required: false,
                in: "query",
                description: "Start date (YYYY-MM-DD)",
                schema: {
                  type: "string",
                },
              },
              {
                name: "to",
                required: false,
                in: "query",
                description: "End date (YYYY-MM-DD)",
                schema: {
                  type: "string",
                },
              },
            ],
            responses: {
              200: {
                description: "Daily revenue statistics fetched successfully.",
                content: {
                  "application/json": {
                    schema: {
                      example: {
                        centerId: null,
                        period: {
                          from: "2026-05-01",
                          to: "2026-05-31",
                        },
                        byDay: [
                          {
                            date: "2026-05-01",
                            courtRevenue: 480000,
                            serviceRevenue: 120000,
                            productRevenue: 45000,
                            grossRevenue: 645000,
                            settledCashRevenue: 315000,
                            pendingCashRevenue: 120000,
                            bookingCount: 3,
                            settledTransactionCount: 2,
                            pendingTransactionCount: 1,
                          },
                        ],
                      },
                    },
                  },
                },
              },
            },
            security: [
              {
                "access-token": [],
              },
            ],
            summary: "Get owner revenue statistics grouped by day",
            tags: ["Revenue"],
          },
        },
        "/api/sport-centers/revenue/cancellations": {
          get: {
            description:
              "Returns cancelled booking totals, refunded credit totals, and a breakdown by center and cancellation reason.",
            operationId: "RevenueController_getRevenueCancellationAnalysis",
            parameters: [
              {
                name: "centerId",
                required: false,
                in: "query",
                description: "Filter by sport center ID",
                schema: {
                  type: "string",
                },
              },
              {
                name: "from",
                required: false,
                in: "query",
                description: "Start date (YYYY-MM-DD)",
                schema: {
                  type: "string",
                },
              },
              {
                name: "to",
                required: false,
                in: "query",
                description: "End date (YYYY-MM-DD)",
                schema: {
                  type: "string",
                },
              },
            ],
            responses: {
              200: {
                description: "Cancellation analysis fetched successfully.",
                content: {
                  "application/json": {
                    schema: {
                      example: {
                        centerId: null,
                        period: {
                          from: "2026-05-01",
                          to: "2026-05-31",
                        },
                        totalCancelledBookingCount: 4,
                        totalCancelledRevenue: 930000,
                        totalRefundedCreditAmount: 390000,
                        byCenter: [
                          {
                            centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                            centerName: "Pickle Dome Sukhumvit",
                            cancelledBookingCount: 2,
                            cancelledRevenue: 420000,
                            refundedCreditAmount: 180000,
                          },
                        ],
                        byReason: [
                          {
                            cancelReason: "OWNER_MANUAL",
                            cancelledBookingCount: 2,
                            cancelledRevenue: 420000,
                            refundedCreditAmount: 180000,
                          },
                        ],
                      },
                    },
                  },
                },
              },
            },
            security: [
              {
                "access-token": [],
              },
            ],
            summary: "Get owner cancellation and refund analysis",
            tags: ["Revenue"],
          },
        },
        "/api/sport-centers/revenue/export/csv": {
          post: {
            description:
              "Generates a CSV file for the filtered payment transaction report, uploads it to the media service, and returns the downloadable Cloudinary URL.",
            operationId: "RevenueController_exportRevenueCsv",
            parameters: [
              {
                name: "centerId",
                required: false,
                in: "query",
                description: "Filter by sport center ID",
                schema: {
                  type: "string",
                },
              },
              {
                name: "from",
                required: false,
                in: "query",
                description: "Start date (YYYY-MM-DD)",
                schema: {
                  type: "string",
                },
              },
              {
                name: "to",
                required: false,
                in: "query",
                description: "End date (YYYY-MM-DD)",
                schema: {
                  type: "string",
                },
              },
              {
                name: "status",
                required: false,
                in: "query",
                schema: {
                  type: "string",
                  enum: ["PENDING_REVIEW", "SETTLED", "REJECTED", "VOIDED"],
                },
              },
              {
                name: "method",
                required: false,
                in: "query",
                schema: {
                  type: "string",
                  enum: ["BANK_TRANSFER", "CASH"],
                },
              },
            ],
            responses: {
              201: {
                description: "CSV export initiated successfully.",
                content: {
                  "application/json": {
                    schema: {
                      example: {
                        fileUrl:
                          "https://res.cloudinary.com/demo/raw/upload/v1234567890/picklehub/reports/revenue-transactions-2026-05-30.csv",
                        publicId:
                          "picklehub/reports/revenue-transactions-2026-05-30",
                        format: "csv",
                      },
                    },
                  },
                },
              },
            },
            security: [
              {
                "access-token": [],
              },
            ],
            summary: "Export owner payment transactions to CSV",
            tags: ["Revenue"],
          },
        },
        "/api/sport-centers/{centerId}/services": {
          post: {
            description:
              "Create a new service offering (equipment rental, coaching, etc.) for a sport center. Owner only.",
            operationId: "ServiceController_create",
            parameters: [
              {
                name: "centerId",
                required: true,
                in: "path",
                schema: {
                  type: "string",
                },
              },
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/CreateServiceDto",
                  },
                },
              },
            },
            responses: {
              201: {
                description: "Service created successfully.",
                content: {
                  "application/json": {
                    schema: {
                      example: {
                        id: "550e8400-e29b-41d4-a716-446655440001",
                        centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                        name: "Racket Rental",
                        description: "Rent a professional pickleball racket",
                        type: "EQUIPMENT_RENTAL",
                        imageUrl:
                          "https://cdn.example.com/services/racket-rental.png",
                        price: 25000,
                        unit: "VND / 3h",
                        isActive: true,
                        createdAt: "2026-05-20T10:00:00.000Z",
                        updatedAt: "2026-05-20T10:00:00.000Z",
                      },
                    },
                  },
                },
              },
              400: {
                description: "Invalid payload.",
              },
              401: {
                description: "Unauthorized - not center owner.",
              },
            },
            security: [
              {
                "access-token": [],
              },
            ],
            summary: "Create service",
            tags: ["Services"],
          },
          get: {
            description: "Get all active services available at a sport center.",
            operationId: "ServiceController_findByCenterId",
            parameters: [
              {
                name: "centerId",
                required: true,
                in: "path",
                schema: {
                  type: "string",
                },
              },
            ],
            responses: {
              200: {
                description: "Services fetched successfully.",
                content: {
                  "application/json": {
                    schema: {
                      example: [
                        {
                          id: "550e8400-e29b-41d4-a716-446655440001",
                          centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                          name: "Racket Rental",
                          description: "Rent a professional pickleball racket",
                          type: "EQUIPMENT_RENTAL",
                          imageUrl:
                            "https://cdn.example.com/services/racket-rental.png",
                          price: 25000,
                          unit: "VND / 3h",
                          isActive: true,
                          createdAt: "2026-05-20T10:00:00.000Z",
                          updatedAt: "2026-05-20T10:00:00.000Z",
                        },
                        {
                          id: "550e8400-e29b-41d4-a716-446655440002",
                          centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                          name: "Pro Coaching Session",
                          description: "30-minute coaching session with a pro",
                          type: "COACHING",
                          imageUrl:
                            "https://cdn.example.com/services/coaching.png",
                          price: 150000,
                          isActive: true,
                          createdAt: "2026-05-20T10:00:00.000Z",
                          updatedAt: "2026-05-20T10:00:00.000Z",
                        },
                      ],
                    },
                  },
                },
              },
            },
            security: [
              {
                "access-token": [],
              },
            ],
            summary: "List available services",
            tags: ["Services"],
          },
        },
        "/api/sport-centers/{centerId}/services/{serviceId}": {
          put: {
            description: "Update a service offering. Owner only.",
            operationId: "ServiceController_update",
            parameters: [
              {
                name: "centerId",
                required: true,
                in: "path",
                schema: {
                  type: "string",
                },
              },
              {
                name: "serviceId",
                required: true,
                in: "path",
                schema: {
                  type: "string",
                },
              },
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/UpdateServiceDto",
                  },
                },
              },
            },
            responses: {
              200: {
                description: "Service updated successfully.",
                content: {
                  "application/json": {
                    schema: {
                      example: {
                        id: "550e8400-e29b-41d4-a716-446655440001",
                        centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                        name: "Racket Rental Plus",
                        description: "Premium racket rental with grip tape",
                        type: "EQUIPMENT_RENTAL",
                        imageUrl:
                          "https://cdn.example.com/services/racket-rental-plus.png",
                        price: 35000,
                        unit: "VND / 3h",
                        isActive: true,
                        createdAt: "2026-05-20T10:00:00.000Z",
                        updatedAt: "2026-05-20T11:00:00.000Z",
                      },
                    },
                  },
                },
              },
              401: {
                description: "Unauthorized - not center owner.",
              },
              404: {
                description: "Service not found.",
              },
            },
            security: [
              {
                "access-token": [],
              },
            ],
            summary: "Update service",
            tags: ["Services"],
          },
          delete: {
            description: "Delete a service offering. Owner only.",
            operationId: "ServiceController_delete",
            parameters: [
              {
                name: "centerId",
                required: true,
                in: "path",
                schema: {
                  type: "string",
                },
              },
              {
                name: "serviceId",
                required: true,
                in: "path",
                schema: {
                  type: "string",
                },
              },
            ],
            responses: {
              200: {
                description: "Service deleted successfully.",
                content: {
                  "application/json": {
                    schema: {
                      example: {
                        id: "550e8400-e29b-41d4-a716-446655440001",
                        centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                        name: "Racket Rental",
                        description: "Rent a professional pickleball racket",
                        type: "EQUIPMENT_RENTAL",
                        imageUrl:
                          "https://cdn.example.com/services/racket-rental.png",
                        price: 25000,
                        unit: "VND / 3h",
                        isActive: false,
                        createdAt: "2026-05-20T10:00:00.000Z",
                        updatedAt: "2026-05-20T11:10:00.000Z",
                      },
                    },
                  },
                },
              },
              401: {
                description: "Unauthorized - not center owner.",
              },
              404: {
                description: "Service not found.",
              },
            },
            security: [
              {
                "access-token": [],
              },
            ],
            summary: "Delete service",
            tags: ["Services"],
          },
        },
        "/api/sport-centers/{centerId}/products": {
          post: {
            description:
              "Create a new product offering (beverages, consumables, etc.) for a sport center. Owner only.",
            operationId: "ProductController_create",
            parameters: [
              {
                name: "centerId",
                required: true,
                in: "path",
                schema: {
                  type: "string",
                },
              },
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/CreateProductDto",
                  },
                },
              },
            },
            responses: {
              201: {
                description: "Product created successfully.",
                content: {
                  "application/json": {
                    schema: {
                      example: {
                        id: "550e8400-e29b-41d4-a716-446655440001",
                        centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                        name: "Pocari Sweat 500ml",
                        description: "Refreshing sports drink",
                        type: "BEVERAGE",
                        imageUrl: "https://cdn.example.com/products/pocari.png",
                        price: 25000,
                        unit: "VND / bottle",
                        stock: 100,
                        isActive: true,
                        createdAt: "2026-05-20T10:00:00.000Z",
                        updatedAt: "2026-05-20T10:00:00.000Z",
                      },
                    },
                  },
                },
              },
              400: {
                description: "Invalid payload.",
              },
              401: {
                description: "Unauthorized - not center owner.",
              },
            },
            security: [
              {
                "access-token": [],
              },
            ],
            summary: "Create product",
            tags: ["Products"],
          },
          get: {
            description:
              "Get all active products available for purchase at a sport center.",
            operationId: "ProductController_findByCenterId",
            parameters: [
              {
                name: "centerId",
                required: true,
                in: "path",
                schema: {
                  type: "string",
                },
              },
            ],
            responses: {
              200: {
                description: "Products fetched successfully.",
                content: {
                  "application/json": {
                    schema: {
                      example: [
                        {
                          id: "550e8400-e29b-41d4-a716-446655440001",
                          centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                          name: "Pocari Sweat 500ml",
                          description: "Refreshing sports drink",
                          type: "BEVERAGE",
                          imageUrl:
                            "https://cdn.example.com/products/pocari.png",
                          price: 25000,
                          unit: "VND / bottle",
                          stock: 100,
                          isActive: true,
                          createdAt: "2026-05-20T10:00:00.000Z",
                          updatedAt: "2026-05-20T10:00:00.000Z",
                        },
                        {
                          id: "550e8400-e29b-41d4-a716-446655440002",
                          centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                          name: "PickleHub Training Shirt",
                          description:
                            "Moisture-wicking performance training shirt",
                          type: "CLOTHING",
                          imageUrl:
                            "https://cdn.example.com/products/training-shirt.png",
                          price: 350000,
                          unit: "VND / piece",
                          stock: 50,
                          isActive: true,
                          createdAt: "2026-05-20T10:00:00.000Z",
                          updatedAt: "2026-05-20T10:00:00.000Z",
                        },
                      ],
                    },
                  },
                },
              },
            },
            security: [
              {
                "access-token": [],
              },
            ],
            summary: "List available products",
            tags: ["Products"],
          },
        },
        "/api/sport-centers/{centerId}/products/{productId}": {
          put: {
            description: "Update a product offering. Owner only.",
            operationId: "ProductController_update",
            parameters: [
              {
                name: "centerId",
                required: true,
                in: "path",
                schema: {
                  type: "string",
                },
              },
              {
                name: "productId",
                required: true,
                in: "path",
                schema: {
                  type: "string",
                },
              },
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/UpdateProductDto",
                  },
                },
              },
            },
            responses: {
              200: {
                description: "Product updated successfully.",
                content: {
                  "application/json": {
                    schema: {
                      example: {
                        id: "550e8400-e29b-41d4-a716-446655440010",
                        centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                        name: "Pocari Sweat 500ml",
                        description: "Refreshing sports drink",
                        type: "BEVERAGE",
                        imageUrl: "https://cdn.example.com/products/pocari.png",
                        price: 25000,
                        unit: "VND / bottle",
                        stock: 95,
                        isActive: true,
                        createdAt: "2026-05-20T10:00:00.000Z",
                        updatedAt: "2026-05-20T11:00:00.000Z",
                      },
                    },
                  },
                },
              },
              401: {
                description: "Unauthorized - not center owner.",
              },
              404: {
                description: "Product not found.",
              },
            },
            security: [
              {
                "access-token": [],
              },
            ],
            summary: "Update product",
            tags: ["Products"],
          },
          delete: {
            description: "Delete a product offering. Owner only.",
            operationId: "ProductController_delete",
            parameters: [
              {
                name: "centerId",
                required: true,
                in: "path",
                schema: {
                  type: "string",
                },
              },
              {
                name: "productId",
                required: true,
                in: "path",
                schema: {
                  type: "string",
                },
              },
            ],
            responses: {
              200: {
                description: "Product deleted successfully.",
                content: {
                  "application/json": {
                    schema: {
                      example: {
                        id: "550e8400-e29b-41d4-a716-446655440010",
                        centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                        name: "Pocari Sweat 500ml",
                        description: "Refreshing sports drink",
                        type: "BEVERAGE",
                        imageUrl: "https://cdn.example.com/products/pocari.png",
                        price: 25000,
                        unit: "VND / bottle",
                        stock: 0,
                        isActive: false,
                        createdAt: "2026-05-20T10:00:00.000Z",
                        updatedAt: "2026-05-20T11:10:00.000Z",
                      },
                    },
                  },
                },
              },
              401: {
                description: "Unauthorized - not center owner.",
              },
              404: {
                description: "Product not found.",
              },
            },
            security: [
              {
                "access-token": [],
              },
            ],
            summary: "Delete product",
            tags: ["Products"],
          },
        },
        "/api/sport-centers/reviews": {
          post: {
            operationId: "ReviewController_create",
            parameters: [],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/CreateReviewDto",
                  },
                },
              },
            },
            responses: {
              201: {
                description: "Review created successfully.",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/ReviewResponseDto",
                    },
                    example: {
                      id: "550e8400-e29b-41d4-a716-446655440000",
                      centerId: "660e8400-e29b-41d4-a716-446655440000",
                      userId: "770e8400-e29b-41d4-a716-446655440000",
                      rating: 4,
                      comment:
                        "Great place! Well maintained courts and friendly staff.",
                      createdAt: "2024-05-21T10:30:00.000Z",
                      updatedAt: "2024-05-21T10:30:00.000Z",
                    },
                  },
                },
              },
            },
            security: [
              {
                "access-token": [],
              },
            ],
            summary: "Create a review for a sport center",
            tags: ["Reviews"],
          },
        },
        "/api/sport-centers/reviews/center/{centerId}": {
          get: {
            operationId: "ReviewController_findByCenterId",
            parameters: [
              {
                name: "centerId",
                required: true,
                in: "path",
                schema: {
                  type: "string",
                },
              },
            ],
            responses: {
              200: {
                description: "Reviews fetched successfully.",
                content: {
                  "application/json": {
                    schema: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/ReviewResponseDto",
                      },
                    },
                    example: [
                      {
                        id: "550e8400-e29b-41d4-a716-446655440000",
                        centerId: "660e8400-e29b-41d4-a716-446655440000",
                        userId: "770e8400-e29b-41d4-a716-446655440000",
                        userName: "John Doe",
                        rating: 5,
                        comment:
                          "Excellent facility! Great service and maintenance.",
                        createdAt: "2024-05-21T10:30:00.000Z",
                        updatedAt: "2024-05-21T10:30:00.000Z",
                      },
                      {
                        id: "550e8400-e29b-41d4-a716-446655440001",
                        centerId: "660e8400-e29b-41d4-a716-446655440000",
                        userId: "770e8400-e29b-41d4-a716-446655440001",
                        userName: "Jane Smith",
                        rating: 4,
                        comment: "Good courts and friendly staff.",
                        createdAt: "2024-05-20T15:45:00.000Z",
                        updatedAt: "2024-05-20T15:45:00.000Z",
                      },
                    ],
                  },
                },
              },
            },
            summary: "Get all reviews for a sport center",
            tags: ["Reviews"],
          },
        },
        "/api/sport-centers/reviews/{id}": {
          patch: {
            operationId: "ReviewController_update",
            parameters: [
              {
                name: "id",
                required: true,
                in: "path",
                schema: {
                  type: "string",
                },
              },
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/UpdateReviewDto",
                  },
                },
              },
            },
            responses: {
              200: {
                description: "Review updated successfully.",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/ReviewResponseDto",
                    },
                    example: {
                      id: "550e8400-e29b-41d4-a716-446655440000",
                      centerId: "660e8400-e29b-41d4-a716-446655440000",
                      userId: "770e8400-e29b-41d4-a716-446655440000",
                      rating: 5,
                      comment: "Updated comment: Excellent facility overall!",
                      createdAt: "2024-05-21T10:30:00.000Z",
                      updatedAt: "2024-05-21T12:00:00.000Z",
                    },
                  },
                },
              },
            },
            security: [
              {
                "access-token": [],
              },
            ],
            summary: "Update your review",
            tags: ["Reviews"],
          },
          delete: {
            operationId: "ReviewController_remove",
            parameters: [
              {
                name: "id",
                required: true,
                in: "path",
                schema: {
                  type: "string",
                },
              },
            ],
            responses: {
              200: {
                description: "Review deleted successfully.",
                content: {
                  "application/json": {
                    example: {
                      message: "Review deleted successfully",
                    },
                  },
                },
              },
            },
            security: [
              {
                "access-token": [],
              },
            ],
            summary: "Delete your review",
            tags: ["Reviews"],
          },
        },
        "/api/sport-centers/favourites": {
          post: {
            operationId: "FavouriteController_add",
            parameters: [],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/CreateFavouriteDto",
                  },
                },
              },
            },
            responses: {
              201: {
                description: "Favourited successfully.",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/FavouriteResponseDto",
                    },
                    example: {
                      id: "550e8400-e29b-41d4-a716-446655440000",
                      centerId: "660e8400-e29b-41d4-a716-446655440000",
                      userId: "770e8400-e29b-41d4-a716-446655440000",
                      createdAt: "2024-05-21T10:30:00.000Z",
                    },
                  },
                },
              },
            },
            security: [
              {
                "access-token": [],
              },
            ],
            summary: "Add a sport center to favourites",
            tags: ["Favourites"],
          },
        },
        "/api/sport-centers/favourites/{centerId}": {
          delete: {
            operationId: "FavouriteController_remove",
            parameters: [
              {
                name: "centerId",
                required: true,
                in: "path",
                schema: {
                  type: "string",
                },
              },
            ],
            responses: {
              200: {
                description: "Removed from favourites successfully.",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/FavouriteResponseDto",
                    },
                    example: {
                      id: "550e8400-e29b-41d4-a716-446655440000",
                      centerId: "660e8400-e29b-41d4-a716-446655440000",
                      userId: "770e8400-e29b-41d4-a716-446655440000",
                      createdAt: "2024-05-21T10:30:00.000Z",
                    },
                  },
                },
              },
            },
            security: [
              {
                "access-token": [],
              },
            ],
            summary: "Remove a sport center from favourites",
            tags: ["Favourites"],
          },
        },
        "/api/sport-centers/favourites/me": {
          get: {
            operationId: "FavouriteController_findMyFavourites",
            parameters: [],
            responses: {
              200: {
                description:
                  "Favourites fetched successfully. Response matches GET /api/sport-centers.",
                content: {
                  "application/json": {
                    schema: {
                      example: {
                        data: [
                          {
                            id: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                            ownerId: "b7d5a0ea-d859-4b71-aa34-67c2e668f7a4",
                            name: "PickleHub District 1",
                            address:
                              "123 Nguyen Hue, District 1, Ho Chi Minh City",
                            phone: "+84901234567",
                            email: "hello@pickledome.com",
                            openTime: "06:00",
                            closeTime: "22:00",
                            basePrice: 80000,
                            status: "ACTIVE",
                            amenities: ["Parking", "Shower", "Cafe"],
                            images: ["https://example.com/image1.jpg"],
                            rules: [
                              "Please arrive 10 mins early",
                              "Non-marking shoes only",
                            ],
                            description:
                              "Pickle Dome Sukhumvit is a modern pickleball venue...",
                            paymentAccountName: "NGUYEN VAN AN",
                            paymentAccountNumber: "1234567890",
                            paymentBankName: "VietcomBank",
                            paymentQrUrl:
                              "https://cdn.example.com/qr/sample-qr.png",
                            createdAt: "2026-04-04T08:00:00.000Z",
                            updatedAt: "2026-04-04T08:00:00.000Z",
                            services: [
                              {
                                id: "550e8400-e29b-41d4-a716-446655440001",
                                centerId:
                                  "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                                name: "Racket Rental",
                                type: "EQUIPMENT_RENTAL",
                                price: 25000,
                                unit: "VND / 3h",
                                imageUrl:
                                  "https://cdn.example.com/services/racket-rental.png",
                                isActive: true,
                              },
                            ],
                            products: [
                              {
                                id: "550e8400-e29b-41d4-a716-446655440010",
                                centerId:
                                  "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                                name: "Pocari Sweat 500ml",
                                type: "BEVERAGE",
                                price: 25000,
                                unit: "VND / bottle",
                                imageUrl:
                                  "https://cdn.example.com/products/pocari.png",
                                stock: 100,
                                isActive: true,
                              },
                            ],
                            _count: {
                              courts: 8,
                            },
                            averageRating: 4.5,
                            reviewCount: 12,
                            isFavourite: true,
                          },
                        ],
                        pagination: {
                          limit: 20,
                          offset: 0,
                          total: 1,
                        },
                      },
                    },
                  },
                },
              },
            },
            security: [
              {
                "access-token": [],
              },
            ],
            summary:
              "Get current user's favourite sport centers (full details)",
            tags: ["Favourites"],
          },
        },
        "/api/sport-centers/favourites/status/{centerId}": {
          get: {
            operationId: "FavouriteController_checkStatus",
            parameters: [
              {
                name: "centerId",
                required: true,
                in: "path",
                schema: {
                  type: "string",
                },
              },
            ],
            responses: {
              200: {
                description: "Status checked successfully.",
                content: {
                  "application/json": {
                    example: {
                      isFavourite: true,
                    },
                  },
                },
              },
            },
            security: [
              {
                "access-token": [],
              },
            ],
            summary:
              "Check if a sport center is favourited by the current user",
            tags: ["Favourites"],
          },
        },
        "/api/sport-centers/customers/list": {
          get: {
            description:
              "Returns a paginated, aggregated customer list for all centers owned by the logged-in owner. Use `centerId` to narrow the scope to one owned center, or omit it to search across all owned centers.",
            operationId: "CustomerController_listCustomers",
            parameters: [
              {
                name: "centerId",
                required: false,
                in: "query",
                description: "Optional owned sport center scope",
                schema: {
                  type: "string",
                },
              },
              {
                name: "keyword",
                required: false,
                in: "query",
                description: "Search by customer name, phone, or email",
                schema: {
                  type: "string",
                },
              },
              {
                name: "name",
                required: false,
                in: "query",
                description: "Filter by customer name",
                schema: {
                  type: "string",
                },
              },
              {
                name: "phone",
                required: false,
                in: "query",
                description: "Filter by customer phone number",
                schema: {
                  type: "string",
                },
              },
              {
                name: "email",
                required: false,
                in: "query",
                description: "Filter by customer email",
                schema: {
                  type: "string",
                },
              },
              {
                name: "lastVisitFrom",
                required: false,
                in: "query",
                description: "Filter by latest visit on or after this date",
                schema: {
                  type: "string",
                },
              },
              {
                name: "lastVisitTo",
                required: false,
                in: "query",
                description: "Filter by latest visit on or before this date",
                schema: {
                  type: "string",
                },
              },
              {
                name: "minSpend",
                required: false,
                in: "query",
                description: "Minimum total spend in VND",
                schema: {
                  type: "number",
                },
              },
              {
                name: "maxSpend",
                required: false,
                in: "query",
                description: "Maximum total spend in VND",
                schema: {
                  type: "number",
                },
              },
              {
                name: "limit",
                required: false,
                in: "query",
                description: "Pagination limit",
                schema: {
                  type: "number",
                },
              },
              {
                name: "offset",
                required: false,
                in: "query",
                description: "Pagination offset",
                schema: {
                  type: "number",
                },
              },
            ],
            responses: {
              200: {
                description: "Customers listed successfully.",
                content: {
                  "application/json": {
                    schema: {
                      example: {
                        scope: {
                          centerId: null,
                          centers: [
                            {
                              id: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                              name: "Pickle Dome Sukhumvit",
                            },
                            {
                              id: "2b2a1e00-3dd3-4d22-9f25-1fdc7f2f5b31",
                              name: "Pickle Dome Thonglor",
                            },
                          ],
                        },
                        data: [
                          {
                            customer: {
                              id: "user-uuid-1234",
                              name: "Sarah Johnson",
                              email: "sarah@example.com",
                              avatarUrl: "https://example.com/avatar/sarah.jpg",
                              phoneNumber: "+66812345678",
                            },
                            summary: {
                              visitCount: 12,
                              completedVisitCount: 9,
                              confirmedVisitCount: 2,
                              pendingVisitCount: 1,
                              cancelledVisitCount: 2,
                              totalSpend: 2755000,
                              cancelledSpend: 420000,
                              creditBalance: 180000,
                              firstVisitAt: "2026-01-04T00:00:00.000Z",
                              lastVisitAt: "2026-05-26T00:00:00.000Z",
                              centerCount: 2,
                            },
                            centers: [
                              {
                                centerId:
                                  "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                                centerName: "Pickle Dome Sukhumvit",
                                visitCount: 8,
                                totalSpend: 1845000,
                                cancelledVisitCount: 1,
                                cancelledSpend: 120000,
                                lastVisitAt: "2026-05-26T00:00:00.000Z",
                              },
                              {
                                centerId:
                                  "2b2a1e00-3dd3-4d22-9f25-1fdc7f2f5b31",
                                centerName: "Pickle Dome Thonglor",
                                visitCount: 4,
                                totalSpend: 910000,
                                cancelledVisitCount: 1,
                                cancelledSpend: 300000,
                                lastVisitAt: "2026-05-14T00:00:00.000Z",
                              },
                            ],
                            latestBooking: {
                              id: "booking-uuid-1",
                              date: "2026-05-26T00:00:00.000Z",
                              status: "CONFIRMED",
                              totalPrice: 315000,
                              creditApplied: 0,
                              paymentRemaining: 315000,
                              cancelReason: null,
                              cancelledAt: null,
                              center: {
                                id: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                                name: "Pickle Dome Sukhumvit",
                              },
                              createdAt: "2026-05-24T08:03:00.000Z",
                            },
                          },
                        ],
                        pagination: {
                          limit: 20,
                          offset: 0,
                          total: 1,
                        },
                      },
                    },
                  },
                },
              },
            },
            security: [
              {
                "access-token": [],
              },
            ],
            summary: "List customers across owned centers",
            tags: ["Customers"],
          },
        },
        "/api/sport-centers/customers/{customerId}": {
          get: {
            description:
              "Returns an aggregated customer profile with visits, spend, cancellations, credit balances, recent bookings, and per-center breakdowns. Use the optional `centerId` query parameter to scope the profile to one owned center.",
            operationId: "CustomerController_getCustomerDetail",
            parameters: [
              {
                name: "customerId",
                required: true,
                in: "path",
                schema: {
                  type: "string",
                },
              },
              {
                name: "centerId",
                required: false,
                in: "query",
                description: "Optional owned sport center scope",
                schema: {
                  type: "string",
                },
              },
            ],
            responses: {
              200: {
                description: "Customer profile fetched successfully.",
                content: {
                  "application/json": {
                    schema: {
                      example: {
                        scope: {
                          centerId: null,
                          centers: [
                            {
                              id: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                              name: "Pickle Dome Sukhumvit",
                            },
                            {
                              id: "2b2a1e00-3dd3-4d22-9f25-1fdc7f2f5b31",
                              name: "Pickle Dome Thonglor",
                            },
                          ],
                        },
                        customer: {
                          id: "user-uuid-1234",
                          name: "Sarah Johnson",
                          email: "sarah@example.com",
                          avatarUrl: "https://example.com/avatar/sarah.jpg",
                          phoneNumber: "+66812345678",
                        },
                        summary: {
                          visitCount: 12,
                          completedVisitCount: 9,
                          confirmedVisitCount: 2,
                          pendingVisitCount: 1,
                          cancelledVisitCount: 2,
                          totalSpend: 2755000,
                          cancelledSpend: 420000,
                          creditBalance: 180000,
                          cancelledRefundAmount: 420000,
                          firstVisitAt: "2026-01-04T00:00:00.000Z",
                          lastVisitAt: "2026-05-26T00:00:00.000Z",
                        },
                        byCenter: [
                          {
                            centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                            centerName: "Pickle Dome Sukhumvit",
                            creditBalance: 120000,
                            visitCount: 8,
                            totalSpend: 1845000,
                            cancelledVisitCount: 1,
                            cancelledSpend: 120000,
                            lastVisitAt: "2026-05-26T00:00:00.000Z",
                            latestCreditTransaction: {
                              id: "tx-uuid-1",
                              bookingId: "booking-uuid-1",
                              amount: 120000,
                              type: "CANCELLATION_REFUND",
                              description:
                                "100% preservation credit refund for player-initiated cancellation",
                              createdAt: "2026-05-22T10:00:00.000Z",
                            },
                          },
                        ],
                        recentBookings: [
                          {
                            id: "booking-uuid-1",
                            center: {
                              id: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                              name: "Pickle Dome Sukhumvit",
                            },
                            date: "2026-05-26T00:00:00.000Z",
                            status: "CONFIRMED",
                            totalPrice: 315000,
                            creditApplied: 0,
                            paymentRemaining: 315000,
                            cancelReason: null,
                            cancelledAt: null,
                            createdAt: "2026-05-24T08:03:00.000Z",
                            bookingItems: [
                              {
                                startTime: "17:00",
                                endTime: "19:00",
                                itemPrice: 240000,
                                court: {
                                  id: "court-uuid-1",
                                  name: "Court 1",
                                },
                              },
                            ],
                          },
                        ],
                        creditWallets: [
                          {
                            centerId: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                            centerName: "Pickle Dome Sukhumvit",
                            creditBalance: 120000,
                            latestCreditTransaction: {
                              id: "tx-uuid-1",
                              bookingId: "booking-uuid-1",
                              amount: 120000,
                              type: "CANCELLATION_REFUND",
                              description:
                                "100% preservation credit refund for player-initiated cancellation",
                              createdAt: "2026-05-22T10:00:00.000Z",
                            },
                          },
                        ],
                      },
                    },
                  },
                },
              },
              404: {
                description: "Customer not found.",
              },
            },
            security: [
              {
                "access-token": [],
              },
            ],
            summary: "Get a customer profile across owned centers",
            tags: ["Customers"],
          },
        },
      },
      info: {
        title: "PickleHub Sport Center Service",
        description:
          'REST API for sport center and court management.\n\n**Base path:** `/api`\n\nEndpoints that require authentication expect a **Bearer JWT access token** in the `Authorization` header.\n\n---\n\n## 🔑 Seed User Accounts (For Testing & Frontend Dev)\n\nUse the following seeded accounts in the **Auth Service** to get your JWT access tokens:\n\n- **👤 Normal User Account:**\n  - **Email:** `seed-user@picklehub.com`\n  - **Password:** `Picklehub123!`\n- **🏢 Sport Center Owner Account:**\n  - **Email:** `seed-owner@picklehub.com`\n  - **Password:** `Picklehub123!`\n\n---\n\n## ⏱️ Booking Payment Timeout\n\nA **PENDING** booking will be **automatically cancelled** if no payment proof is uploaded within **10 minutes** of creation. The system runs a background check every minute.\n\n**What happens on timeout:**\n- Booking status → `CANCELLED` (reason: `PAYMENT_TIMEOUT`)\n- Reserved court slots are released back to availability\n- Product stock is restored\n- Any pre-applied preservation credit is fully refunded back to the player\'s wallet\n- Player receives an in-app + email notification\n\n**Frontend integration:**\n- The `POST /bookings` response includes the following fields when the status is `PENDING`:\n  - `expiresAt`: The precise ISO timestamp of when the booking will expire (e.g. `2026-05-06T08:10:00.000Z`). **Use this to calculate and display a live countdown timer**.\n  - `bookingTimeoutMinutes`: The timeout duration in minutes (e.g. `10`). **Use this to display static helper hints** like *"You have 10 minutes to pay and upload your receipt."*\n- Both fields will be `null` if the booking is fully paid with credit and auto-confirmed instantly at creation time.\n',
        version: "1.0",
        contact: {},
      },
      tags: [],
      servers: [],
      components: {
        securitySchemes: {
          "access-token": {
            scheme: "bearer",
            bearerFormat: "JWT",
            type: "http",
          },
          "internal-service-token": {
            type: "apiKey",
            in: "header",
            name: "x-internal-service-token",
            description: "Token for inter-service communication",
          },
        },
        schemas: {
          CreateCenterDto: {
            type: "object",
            properties: {
              name: {
                type: "string",
                example: "PickleHub District 1",
                description: "Sport center display name",
              },
              address: {
                type: "string",
                example: "123 Nguyen Hue, District 1, Ho Chi Minh City",
                description: "Sport center full address",
              },
              phone: {
                type: "string",
                example: "+84901234567",
                description: "Contact phone number",
              },
              email: {
                type: "string",
                example: "hello@pickledome.com",
                description: "Contact email address",
              },
              description: {
                type: "string",
                example:
                  "Pickle Dome Sukhumvit is a modern pickleball venue...",
                description: "Detailed description of the center",
              },
              images: {
                example: ["https://example.com/image1.jpg"],
                description: "List of image URLs for gallery and headers",
                type: "array",
                items: {
                  type: "string",
                },
              },
              rules: {
                example: [
                  "Please arrive 10 mins early",
                  "Non-marking shoes only",
                ],
                description: "List of rules and regulations",
                type: "array",
                items: {
                  type: "string",
                },
              },
              openTime: {
                type: "string",
                example: "06:00",
                description: "Opening time in HH:mm format",
              },
              closeTime: {
                type: "string",
                example: "22:00",
                description: "Closing time in HH:mm format",
              },
              basePrice: {
                type: "number",
                example: 80000,
                description:
                  "Base price per hour (VND). Applied to any time window not covered by a specific price slot.",
              },
              status: {
                type: "string",
                enum: ["ACTIVE", "INACTIVE"],
                example: "ACTIVE",
                description: "Lifecycle status of the sport center",
              },
              amenities: {
                example: ["Parking", "Shower", "Cafe"],
                description: "Amenities available at the sport center",
                type: "array",
                items: {
                  type: "string",
                },
              },
              paymentAccountName: {
                type: "string",
                example: "NGUYEN VAN AN",
                description:
                  "Bank account holder name shown to players after booking",
              },
              paymentAccountNumber: {
                type: "string",
                example: "1234567890",
                description: "Bank account number for payment transfers",
              },
              paymentBankName: {
                type: "string",
                example: "VietcomBank",
                description:
                  "Name of the receiving bank (e.g. Techcombank, VietcomBank)",
              },
              paymentQrUrl: {
                type: "string",
                example: "https://cdn.example.com/qr/sample-qr.png",
                description:
                  "URL of the QR code image for in-app payment scanning (optional)",
              },
            },
            required: [
              "name",
              "address",
              "phone",
              "openTime",
              "closeTime",
              "basePrice",
              "paymentAccountName",
              "paymentAccountNumber",
              "paymentBankName",
            ],
          },
          UpdateCenterDto: {
            type: "object",
            properties: {
              name: {
                type: "string",
                example: "PickleHub District 1",
                description: "Sport center display name",
              },
              address: {
                type: "string",
                example: "123 Nguyen Hue, District 1, Ho Chi Minh City",
                description: "Sport center full address",
              },
              phone: {
                type: "string",
                example: "+84901234567",
                description: "Contact phone number",
              },
              email: {
                type: "string",
                example: "hello@pickledome.com",
                description: "Contact email address",
              },
              description: {
                type: "string",
                example:
                  "Pickle Dome Sukhumvit is a modern pickleball venue...",
                description: "Detailed description of the center",
              },
              images: {
                example: ["https://example.com/image1.jpg"],
                description: "List of image URLs for gallery and headers",
                type: "array",
                items: {
                  type: "string",
                },
              },
              rules: {
                example: [
                  "Please arrive 10 mins early",
                  "Non-marking shoes only",
                ],
                description: "List of rules and regulations",
                type: "array",
                items: {
                  type: "string",
                },
              },
              openTime: {
                type: "string",
                example: "06:00",
                description: "Opening time in HH:mm format",
              },
              closeTime: {
                type: "string",
                example: "22:00",
                description: "Closing time in HH:mm format",
              },
              basePrice: {
                type: "number",
                example: 80000,
                description:
                  "Base price per hour (VND). Applied to any time window not covered by a specific price slot.",
              },
              amenities: {
                example: ["Parking", "Shower", "Cafe"],
                description: "Amenities available at the sport center",
                type: "array",
                items: {
                  type: "string",
                },
              },
              paymentAccountName: {
                type: "string",
                example: "NGUYEN VAN AN",
                description:
                  "Bank account holder name shown to players after booking",
              },
              paymentAccountNumber: {
                type: "string",
                example: "1234567890",
                description: "Bank account number for payment transfers",
              },
              paymentBankName: {
                type: "string",
                example: "VietcomBank",
                description:
                  "Name of the receiving bank (e.g. Techcombank, VietcomBank)",
              },
              paymentQrUrl: {
                type: "string",
                example: "https://cdn.example.com/qr/sample-qr.png",
                description:
                  "URL of the QR code image for in-app payment scanning (optional)",
              },
            },
          },
          CreateCenterPriceSlotDto: {
            type: "object",
            properties: {
              startTime: {
                type: "string",
                example: "06:00",
                description: "Start time in HH:MM format",
              },
              endTime: {
                type: "string",
                example: "12:00",
                description: "End time in HH:MM format",
              },
              pricePerHour: {
                type: "number",
                example: 100000,
                description: "Price per hour in local currency",
              },
            },
            required: ["startTime", "endTime", "pricePerHour"],
          },
          UpdateCenterPriceSlotsDto: {
            type: "object",
            properties: {
              priceSlots: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/CreateCenterPriceSlotDto",
                },
              },
            },
            required: ["priceSlots"],
          },
          CancellationTierDto: {
            type: "object",
            properties: {
              minDaysBeforeStart: {
                type: "number",
                example: 2,
                description:
                  "Minimum whole days before booking start time the player must cancel to earn this refund percentage. Must be >= 1.",
                minimum: 1,
              },
              refundPercent: {
                type: "number",
                example: 100,
                description:
                  "Percentage of totalPrice refunded as preservation credit (0-100).",
                minimum: 0,
                maximum: 100,
              },
            },
            required: ["minDaysBeforeStart", "refundPercent"],
          },
          UpdateCancellationPolicyDto: {
            type: "object",
            properties: {
              allowCancellation: {
                type: "boolean",
                example: true,
                description:
                  "Whether players are allowed to self-cancel a CONFIRMED booking and earn preservation credit.",
              },
              tiers: {
                description:
                  "Ordered list of refund tiers. Each tier applies when the player cancels at least minDaysBeforeStart whole days before the booking start time. The highest-threshold qualifying tier wins; cancellations below the lowest tier earn 0% credit. Pass an empty array to disable all refunds.",
                example: [
                  {
                    minDaysBeforeStart: 2,
                    refundPercent: 100,
                  },
                  {
                    minDaysBeforeStart: 1,
                    refundPercent: 75,
                  },
                ],
                type: "array",
                items: {
                  $ref: "#/components/schemas/CancellationTierDto",
                },
              },
            },
          },
          CreateCourtDto: {
            type: "object",
            properties: {
              name: {
                type: "string",
                example: "San 1",
                description: "Court display name inside the sport center",
              },
              type: {
                type: "string",
                enum: ["INDOOR", "OUTDOOR"],
                example: "INDOOR",
                description: "Physical court type",
              },
              status: {
                type: "string",
                enum: ["ACTIVE", "MAINTENANCE", "ARCHIVED"],
                example: "ACTIVE",
                description: "Lifecycle status of the court",
              },
            },
            required: ["name", "type"],
          },
          UpdateCourtDto: {
            type: "object",
            properties: {
              name: {
                type: "string",
                example: "San 1",
                description: "Court display name inside the sport center",
              },
              type: {
                type: "string",
                enum: ["INDOOR", "OUTDOOR"],
                example: "INDOOR",
                description: "Physical court type",
              },
              status: {
                type: "string",
                enum: ["ACTIVE", "MAINTENANCE", "ARCHIVED"],
                example: "ACTIVE",
                description: "Lifecycle status of the court",
              },
            },
          },
          BookingRequestItemDto: {
            type: "object",
            properties: {
              courtId: {
                type: "string",
                example: "f21ddb56-dd63-4e92-9b01-e3bc6784b972",
                description: "Court ID to book",
              },
              startTime: {
                type: "string",
                example: "17:00",
                description: "Start time in HH:MM format",
              },
              endTime: {
                type: "string",
                example: "19:00",
                description: "End time in HH:MM format",
              },
            },
            required: ["courtId", "startTime", "endTime"],
          },
          BookingServiceItemDto: {
            type: "object",
            properties: {
              serviceId: {
                type: "string",
                example: "550e8400-e29b-41d4-a716-446655440001",
                description: "Service ID to include in booking",
              },
              quantity: {
                type: "number",
                example: 1,
                description: "Quantity of this service to book",
                minimum: 1,
              },
            },
            required: ["serviceId"],
          },
          BookingProductItemDto: {
            type: "object",
            properties: {
              productId: {
                type: "string",
                example: "550e8400-e29b-41d4-a716-446655440010",
                description: "Product ID to include in booking",
              },
              quantity: {
                type: "number",
                example: 2,
                description: "Quantity of this product to book",
                minimum: 1,
              },
            },
            required: ["productId"],
          },
          PreviewBookingDto: {
            type: "object",
            properties: {
              date: {
                type: "string",
                example: "2026-05-15",
                description: "Booking date in YYYY-MM-DD format",
              },
              items: {
                description:
                  "List of courts/time ranges to preview in this center on the same date. Each item must be at least 30 minutes and align to 30-minute boundaries (e.g. 17:00, 17:30, 18:00).",
                example: [
                  {
                    courtId: "f21ddb56-dd63-4e92-9b01-e3bc6784b972",
                    startTime: "17:30",
                    endTime: "19:00",
                  },
                  {
                    courtId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                    startTime: "19:00",
                    endTime: "21:00",
                  },
                ],
                type: "array",
                items: {
                  $ref: "#/components/schemas/BookingRequestItemDto",
                },
              },
              serviceItems: {
                example: [
                  {
                    serviceId: "550e8400-e29b-41d4-a716-446655440001",
                    quantity: 1,
                  },
                ],
                description: "Preferred service line items to preview",
                type: "array",
                items: {
                  $ref: "#/components/schemas/BookingServiceItemDto",
                },
              },
              productItems: {
                example: [
                  {
                    productId: "550e8400-e29b-41d4-a716-446655440010",
                    quantity: 2,
                  },
                ],
                description: "Preferred product line items to preview",
                type: "array",
                items: {
                  $ref: "#/components/schemas/BookingProductItemDto",
                },
              },
            },
            required: ["date", "items"],
          },
          BookingDayItemDto: {
            type: "object",
            properties: {
              date: {
                type: "string",
                example: "2026-05-15",
                description: "Booking date in YYYY-MM-DD format",
              },
              items: {
                description:
                  "List of courts/time ranges to book in this center on this date. Each item must be at least 30 minutes and align to 30-minute boundaries.",
                example: [
                  {
                    courtId: "f21ddb56-dd63-4e92-9b01-e3bc6784b972",
                    startTime: "17:30",
                    endTime: "19:00",
                  },
                ],
                type: "array",
                items: {
                  $ref: "#/components/schemas/BookingRequestItemDto",
                },
              },
              serviceItems: {
                example: [
                  {
                    serviceId: "550e8400-e29b-41d4-a716-446655440001",
                    quantity: 1,
                  },
                ],
                description:
                  "Preferred service line items to include in booking",
                type: "array",
                items: {
                  $ref: "#/components/schemas/BookingServiceItemDto",
                },
              },
              serviceIds: {
                example: ["550e8400-e29b-41d4-a716-446655440001"],
                description: "Legacy list of service IDs to include in booking",
                deprecated: true,
                type: "array",
                items: {
                  type: "string",
                },
              },
              productItems: {
                example: [
                  {
                    productId: "550e8400-e29b-41d4-a716-446655440010",
                    quantity: 2,
                  },
                ],
                description:
                  "Preferred product line items to include in booking",
                type: "array",
                items: {
                  $ref: "#/components/schemas/BookingProductItemDto",
                },
              },
              productIds: {
                example: ["550e8400-e29b-41d4-a716-446655440010"],
                description: "Legacy list of product IDs to include in booking",
                deprecated: true,
                type: "array",
                items: {
                  type: "string",
                },
              },
              note: {
                type: "string",
                example: "Need extra balls",
                description: "Optional note from the player",
              },
            },
            required: ["date", "items"],
          },
          CreateBookingDto: {
            type: "object",
            properties: {
              bookings: {
                description: "List of bookings per day",
                type: "array",
                items: {
                  $ref: "#/components/schemas/BookingDayItemDto",
                },
              },
              playerName: {
                type: "string",
                example: "John Doe",
                description: "Name of the player creating the booking",
              },
              phoneNumber: {
                type: "string",
                example: "+66 81 234 5678",
                description:
                  "Phone number provided by the player for this booking",
              },
              useCredit: {
                type: "boolean",
                example: true,
                description:
                  "If true, available preservation credit at this sport center is applied toward the total price.",
                default: false,
              },
            },
            required: ["bookings", "playerName", "phoneNumber"],
          },
          SubmitPaymentProofDto: {
            type: "object",
            properties: {
              paymentProofUrl: {
                type: "string",
                example: "https://cdn.example.com/proofs/transfer-receipt.jpg",
                description:
                  "Public URL of the payment proof image (bank transfer screenshot)",
              },
            },
            required: ["paymentProofUrl"],
          },
          OwnerCreateBookingDto: {
            type: "object",
            properties: {
              date: {
                type: "string",
                example: "2026-05-15",
                description: "Booking date in YYYY-MM-DD format",
              },
              items: {
                description:
                  "List of courts/time ranges to book in this center on the same date. Each item must be at least 30 minutes and align to 30-minute boundaries (e.g. 17:00, 17:30, 18:00).",
                example: [
                  {
                    courtId: "f21ddb56-dd63-4e92-9b01-e3bc6784b972",
                    startTime: "17:30",
                    endTime: "19:00",
                  },
                  {
                    courtId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                    startTime: "19:00",
                    endTime: "21:00",
                  },
                ],
                type: "array",
                items: {
                  $ref: "#/components/schemas/BookingRequestItemDto",
                },
              },
              playerName: {
                type: "string",
                example: "John Doe",
                description:
                  "Name of the player booking directly at the center",
              },
              phoneNumber: {
                type: "string",
                example: "+66 81 234 5678",
                description:
                  "Phone number provided by the owner for this booking",
              },
              serviceItems: {
                example: [
                  {
                    serviceId: "550e8400-e29b-41d4-a716-446655440001",
                    quantity: 1,
                  },
                ],
                description:
                  "Preferred service line items to include in booking",
                type: "array",
                items: {
                  $ref: "#/components/schemas/BookingServiceItemDto",
                },
              },
              serviceIds: {
                example: [
                  "550e8400-e29b-41d4-a716-446655440001",
                  "550e8400-e29b-41d4-a716-446655440002",
                ],
                description: "Legacy list of service IDs to include in booking",
                deprecated: true,
                type: "array",
                items: {
                  type: "string",
                },
              },
              productItems: {
                example: [
                  {
                    productId: "550e8400-e29b-41d4-a716-446655440010",
                    quantity: 2,
                  },
                ],
                description:
                  "Preferred product line items to include in booking",
                type: "array",
                items: {
                  $ref: "#/components/schemas/BookingProductItemDto",
                },
              },
              productIds: {
                example: [
                  "550e8400-e29b-41d4-a716-446655440010",
                  "550e8400-e29b-41d4-a716-446655440011",
                ],
                description: "Legacy list of product IDs to include in booking",
                deprecated: true,
                type: "array",
                items: {
                  type: "string",
                },
              },
              note: {
                type: "string",
                example: "Walk-in customer",
                description: "Optional note from the owner",
              },
            },
            required: ["date", "items", "playerName", "phoneNumber"],
          },
          BatchBookingsDto: {
            type: "object",
            properties: {
              bookingIds: {
                example: [
                  "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                  "f21ddb56-dd63-4e92-9b01-e3bc6784b972",
                ],
                description: "List of booking IDs to fetch",
                type: "array",
                items: {
                  type: "string",
                },
              },
            },
            required: ["bookingIds"],
          },
          LinkPlaySessionDto: {
            type: "object",
            properties: {
              bookingIds: {
                example: ["a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d"],
                description: "List of booking IDs to link.",
                type: "array",
                items: {
                  type: "string",
                },
              },
              playSessionId: {
                type: "string",
                example: "8c24b2c6-0e6a-4a24-8f3d-9e0a3d3b2e11",
                description: "Play session ID linked to these bookings.",
              },
            },
            required: ["bookingIds", "playSessionId"],
          },
          UnlinkPlaySessionDto: {
            type: "object",
            properties: {
              bookingIds: {
                example: ["a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d"],
                description: "List of booking IDs to unlink.",
                type: "array",
                items: {
                  type: "string",
                },
              },
              playSessionId: {
                type: "string",
                example: "8c24b2c6-0e6a-4a24-8f3d-9e0a3d3b2e11",
                description: "Play session ID to unlink these bookings from.",
              },
            },
            required: ["bookingIds", "playSessionId"],
          },
          QueryPlayerBookingsDto: {
            type: "object",
            properties: {
              playerId: {
                type: "string",
                description: "ID of the player",
              },
              startDate: {
                type: "string",
                description: "Start date (YYYY-MM-DD)",
              },
              endDate: {
                type: "string",
                description: "End date (YYYY-MM-DD)",
              },
            },
            required: ["playerId"],
          },
          CreateServiceDto: {
            type: "object",
            properties: {
              name: {
                type: "string",
                example: "Racket Rental",
                description: "Service name",
              },
              description: {
                type: "string",
                example: "Rent a professional pickleball racket",
                description: "Service description",
              },
              type: {
                type: "string",
                enum: ["EQUIPMENT_RENTAL", "COACHING", "FACILITY_ADD_ON"],
                example: "EQUIPMENT_RENTAL",
                description: "Type of service",
              },
              price: {
                type: "number",
                example: 25000,
                description: "Service price in VND",
              },
              unit: {
                type: "string",
                example: "VND / 3h",
                description: "Displayed unit for the service price",
              },
              imageUrl: {
                type: "string",
                example: "https://cdn.example.com/services/racket-rental.png",
                description: "Optional image URL for the service",
              },
            },
            required: ["name", "type", "price"],
          },
          UpdateServiceDto: {
            type: "object",
            properties: {
              name: {
                type: "string",
                example: "Racket Rental",
                description: "Service name",
              },
              description: {
                type: "string",
                example: "Rent a professional pickleball racket",
                description: "Service description",
              },
              type: {
                type: "string",
                enum: ["EQUIPMENT_RENTAL", "COACHING", "FACILITY_ADD_ON"],
                example: "EQUIPMENT_RENTAL",
                description: "Type of service",
              },
              price: {
                type: "number",
                example: 25000,
                description: "Service price in VND",
              },
              unit: {
                type: "string",
                example: "VND / 3h",
                description: "Displayed unit for the service price",
              },
              imageUrl: {
                type: "string",
                example: "https://cdn.example.com/services/racket-rental.png",
                description: "Optional image URL for the service",
              },
              isActive: {
                type: "boolean",
                example: true,
                description: "Whether the service is active",
              },
            },
          },
          CreateProductDto: {
            type: "object",
            properties: {
              name: {
                type: "string",
                example: "Pocari Sweat 500ml",
                description: "Product name",
              },
              description: {
                type: "string",
                example: "Refreshing sports drink",
                description: "Product description",
              },
              type: {
                type: "string",
                enum: ["BEVERAGE", "CONSUMABLE", "EQUIPMENT", "CLOTHING"],
                example: "BEVERAGE",
                description: "Type of product",
              },
              price: {
                type: "number",
                example: 25000,
                description: "Product price in VND",
              },
              unit: {
                type: "string",
                example: "VND / bottle",
                description: "Displayed unit for the product price",
              },
              imageUrl: {
                type: "string",
                example: "https://cdn.example.com/products/pocari.png",
                description: "Optional image URL for the product",
              },
              stock: {
                type: "number",
                example: 100,
                description: "Stock quantity available",
              },
            },
            required: ["name", "type", "price"],
          },
          UpdateProductDto: {
            type: "object",
            properties: {
              name: {
                type: "string",
                example: "Pocari Sweat 500ml",
                description: "Product name",
              },
              description: {
                type: "string",
                example: "Refreshing sports drink",
                description: "Product description",
              },
              type: {
                type: "string",
                enum: ["BEVERAGE", "CONSUMABLE", "EQUIPMENT", "CLOTHING"],
                example: "BEVERAGE",
                description: "Type of product",
              },
              price: {
                type: "number",
                example: 25000,
                description: "Product price in VND",
              },
              unit: {
                type: "string",
                example: "VND / bottle",
                description: "Displayed unit for the product price",
              },
              imageUrl: {
                type: "string",
                example: "https://cdn.example.com/products/pocari.png",
                description: "Optional image URL for the product",
              },
              stock: {
                type: "number",
                example: 100,
                description: "Stock quantity available",
              },
              isActive: {
                type: "boolean",
                example: true,
                description: "Whether the product is active",
              },
            },
          },
          CreateReviewDto: {
            type: "object",
            properties: {
              centerId: {
                type: "string",
                example: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                description: "Sport center ID",
              },
              rating: {
                type: "number",
                example: 5,
                description: "Rating from 1 to 5",
              },
              comment: {
                type: "string",
                example: "Great place!",
                description: "Review comment",
              },
            },
            required: ["centerId", "rating"],
          },
          ReviewResponseDto: {
            type: "object",
            properties: {
              id: {
                type: "string",
                example: "550e8400-e29b-41d4-a716-446655440000",
              },
              centerId: {
                type: "string",
                example: "660e8400-e29b-41d4-a716-446655440000",
              },
              userId: {
                type: "string",
                example: "770e8400-e29b-41d4-a716-446655440000",
              },
              userName: {
                type: "string",
                example: "John Doe",
              },
              rating: {
                type: "number",
                example: 4,
              },
              comment: {
                type: "object",
                example:
                  "Great place! Well maintained courts and friendly staff.",
                nullable: true,
              },
              createdAt: {
                format: "date-time",
                type: "string",
                example: "2024-05-21T10:30:00.000Z",
              },
              updatedAt: {
                format: "date-time",
                type: "string",
                example: "2024-05-21T10:30:00.000Z",
              },
            },
            required: [
              "id",
              "centerId",
              "userId",
              "userName",
              "rating",
              "comment",
              "createdAt",
              "updatedAt",
            ],
          },
          UpdateReviewDto: {
            type: "object",
            properties: {
              rating: {
                type: "number",
                example: 4,
                description: "Rating from 1 to 5",
              },
              comment: {
                type: "string",
                example: "Updated comment",
                description: "Review comment",
              },
            },
          },
          CreateFavouriteDto: {
            type: "object",
            properties: {
              centerId: {
                type: "string",
                example: "9d3d7b25-aeeb-4e23-a7dd-c8f319275d1a",
                description: "Sport center ID",
              },
            },
            required: ["centerId"],
          },
          FavouriteResponseDto: {
            type: "object",
            properties: {
              id: {
                type: "string",
                example: "550e8400-e29b-41d4-a716-446655440000",
              },
              centerId: {
                type: "string",
                example: "660e8400-e29b-41d4-a716-446655440000",
              },
              userId: {
                type: "string",
                example: "770e8400-e29b-41d4-a716-446655440000",
              },
              createdAt: {
                format: "date-time",
                type: "string",
                example: "2024-05-21T10:30:00.000Z",
              },
            },
            required: ["id", "centerId", "userId", "createdAt"],
          },
        },
      },
    },
    customOptions: {
      persistAuthorization: true,
    },
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
