export const projects = [
  {
    title: "Investment Tracker",
    featured: true,
    description: {
      es: "Sistema modular de seguimiento de activos construido para explorar arquitectura de microservicios en un contexto real. Cada módulo (autenticación, activos, operaciones) corre como servicio independiente, se comunica por eventos y es desplegable por separado con Docker.",
      en: "Modular asset-tracking system built to explore microservices architecture in a real context. Each module (auth, assets, operations) runs as an independent service, communicates through events, and can be deployed separately with Docker.",
    },
    highlights: {
      es: [
        "Arquitectura de microservicios con API Gateway y comunicación asíncrona via RabbitMQ",
        "Contenerización completa con Docker y Docker Compose",
        "Persistencia con PostgreSQL y Entity Framework Core",
      ],
      en: [
        "Microservices architecture with API Gateway and async communication via RabbitMQ",
        "Full containerization with Docker and Docker Compose",
        "Persistence with PostgreSQL and Entity Framework Core",
      ],
    },
    stack: ".NET Core • Docker • RabbitMQ • PostgreSQL • Entity Framework Core",
    link: "https://github.com/ConstanzaCarnet/InvestmentTracker.git",
  },
  {
    title: "Curnocopia App",
    featured: false,
    description: {
      es: "Aplicación de gestión comercial con backend Laravel desarrollada para administrar productos, pedidos y clientes. Incluye integración con la API de AFIP para emisión de facturas electrónicas, un requisito técnico real del mercado argentino.",
      en: "Commercial management app with a Laravel backend, developed to manage products, orders, and customers. Includes integration with the AFIP API for electronic invoice generation, a real technical requirement of the Argentine market.",
    },
    highlights: {
      es: [
        "Integración con SDK de AFIP para facturación electrónica",
        "Backend MVC con Laravel, MySQL y autenticación por roles",
        "Gestión de inventario, órdenes y clientes",
      ],
      en: [
        "AFIP SDK integration for electronic invoicing",
        "MVC backend with Laravel, MySQL, and role-based authentication",
        "Inventory, order, and customer management",
      ],
    },
    stack: "PHP • Laravel • MySQL • SDK AFIP",
    link: "https://github.com/ConstanzaCarnet/CurnocopiaApp.git",
  },
];
