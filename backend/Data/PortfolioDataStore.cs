using PortfolioApi.Models;

namespace PortfolioApi.Data;

public static class PortfolioDataStore
{
    public static PortfolioDataResponse GetAll() => new(Projects, Experiences);

    private static readonly Project[] Projects =
    [
        new(
            Title: "Investment Tracker",
            Featured: true,
            Description: new(
                Es: "Sistema modular de trading construido para explorar arquitectura de microservicios en un contexto real. Cada módulo (autenticación, activos, operaciones) corre como servicio independiente, se comunica por eventos y es desplegable por separado con Docker.",
                En: "Modular trading system built to explore microservices architecture in a real context. Each module (auth, assets, operations) runs as an independent service, communicates through events, and can be deployed separately with Docker."
            ),
            Highlights: new(
                Es: [
                    "Arquitectura de microservicios con API Gateway y comunicación asíncrona via RabbitMQ",
                    "Contenerización completa con Docker y Docker Compose",
                    "Persistencia con PostgreSQL y Entity Framework Core"
                ],
                En: [
                    "Microservices architecture with API Gateway and async communication via RabbitMQ",
                    "Full containerization with Docker and Docker Compose",
                    "Persistence with PostgreSQL and Entity Framework Core"
                ]
            ),
            Stack: ".NET Core • Docker • RabbitMQ • PostgreSQL • Entity Framework Core",
            Link: "https://github.com/ConstanzaCarnet/InvestmentTracker.git"
        ),
        new(
            Title: "Curnocopia App",
            Featured: false,
            Description: new(
                Es: "Aplicación de gestión comercial con backend Laravel desarrollada para administrar productos, pedidos y clientes. Incluye integración con la API de AFIP para emisión de facturas electrónicas.",
                En: "Commercial management app with a Laravel backend, developed to manage products, orders, and customers. Includes integration with the AFIP API for electronic invoice generation."
            ),
            Highlights: new(
                Es: [
                    "Integración con SDK de AFIP para facturación electrónica",
                    "Backend MVC con Laravel, MySQL y autenticación por roles",
                    "Gestión de inventario, órdenes y clientes"
                ],
                En: [
                    "AFIP SDK integration for electronic invoicing",
                    "MVC backend with Laravel, MySQL, and role-based authentication",
                    "Inventory, order, and customer management"
                ]
            ),
            Stack: "PHP • Laravel • MySQL • SDK AFIP",
            Link: "https://github.com/ConstanzaCarnet/CurnocopiaApp.git"
        )
    ];

    private static readonly Experience[] Experiences =
    [
        new(
            Role: new("Desarrollo de Proyectos Independientes", "Independent Project Development"),
            Company: new("Autodidacta", "Self-taught"),
            Period: new("2021 - Presente", "2021 - Present"),
            Description: new(
                Es: "Desarrollo continuo de proyectos personales para aplicar y profundizar conocimientos técnicos. Incluye un sistema de trading modular con arquitectura de microservicios, una app de gestión comercial integrada con AFIP, y este portfolio con dashboard financiero en tiempo real.",
                En: "Continuous development of personal projects to apply and deepen technical knowledge. Includes a modular trading system with microservices architecture, a commercial management app integrated with AFIP, and this portfolio with a real-time financial dashboard."
            ),
            Skills: "C# · .NET Core · PHP · Laravel · React · Docker · RabbitMQ · PostgreSQL · MySQL · Microservicios"
        ),
        new(
            Role: new("Representante de Atención al Cliente & Ventas", "Customer Service & Sales Representative"),
            Company: new("Call Center", "Call Center"),
            Period: new("2021 - 2025", "2021 - 2025"),
            Description: new(
                Es: "Gestión avanzada de clientes, cumplimiento de objetivos de ventas y resolución ágil de reclamos técnicos y comerciales bajo metodologías de métricas de calidad.",
                En: "Advanced client management, achieving sales objectives, and agile resolution of technical and commercial complaints under quality metrics methodologies."
            ),
            Skills: "Comunicación • Resolución de Conflictos • Trabajo en Equipo"
        ),
        new(
            Role: new("Encargada de Atención al Público y Caja", "Customer Service & Cashier Manager"),
            Company: new("Panadería Independencia (Negocio Propio)", "Panadería Independencia (Own Business)"),
            Period: new("2016 - 2021", "2016 - 2021"),
            Description: new(
                Es: "Gestión integral de caja, atención al público, manejo de stock, proveedores y control diario de operaciones comerciales.",
                En: "Full cash register management, customer service, inventory management, supplier relations, and daily commercial operations control."
            ),
            Skills: "Autogestión • Organización • Liderazgo Comercial"
        )
    ];
}
