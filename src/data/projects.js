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
  {
    title: "Interview English Coach",
    featured: false,
    description: {
      es: "Coach de inglés con IA para entrevistas IT. La API en .NET arma los prompts y consume Gemini del lado del servidor, así la API key nunca llega al navegador.",
      en: "AI-powered English coach for IT job interviews. The .NET API builds the prompts and calls Gemini server-side, so the API key never reaches the browser.",
    },
    highlights: {
      es: [
        "Defensa contra inyección de prompts (sanitización de texto externo), rate limiting por IP, CORS cerrado, CSP y cabeceras de seguridad",
        "105 tests (69 en xUnit) sobre sanitización, validación y errores del modelo",
        "Docker Compose con nginx como proxy",
      ],
      en: [
        "Prompt-injection defense (external text sanitization), per-IP rate limiting, locked-down CORS, CSP, and security headers",
        "105 tests (69 in xUnit) covering sanitization, validation, and model errors",
        "Docker Compose with nginx as a reverse proxy",
      ],
    },
    stack: ".NET 9 Minimal API • React • Gemini API • xUnit • Docker • nginx",
    link: "https://github.com/ConstanzaCarnet/interview-english-coach",
  },
  {
    title: "Sales Management",
    featured: false,
    description: {
      es: "API REST en .NET para ventas, productos y usuarios, organizada en capas con patrón Repository.",
      en: ".NET REST API for sales, products, and users, built in layers with the Repository pattern.",
    },
    highlights: {
      es: [
        "Arquitectura en capas con patrón Repository",
        "Consultas parametrizadas contra SQL Server",
        "Credenciales por variables de entorno y documentación con Swagger",
      ],
      en: [
        "Layered architecture with the Repository pattern",
        "Parameterized queries against SQL Server",
        "Credentials via environment variables and Swagger documentation",
      ],
    },
    stack: "C# • ASP.NET Core • SQL Server • ADO.NET • Swagger",
    link: "https://github.com/ConstanzaCarnet/dotnet-rest-api",
  },
];
