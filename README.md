# Umbra: CSS Shadow Designer

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/rgsbsogt/generated-app-20250929-231132)

Umbra is a visually stunning, real-time CSS `box-shadow` generator designed for developers and designers who appreciate minimalist aesthetics and powerful tools. The application provides an intuitive interface for crafting complex, layered shadows with instant visual feedback. The entire experience is wrapped in a clean, uncluttered interface that prioritizes focus and creativity, adhering to the 'less is more' philosophy.

## Key Features

-   **Multi-Layer Shadow System:** Create depth and complexity by stacking multiple shadow layers.
-   **Real-Time Live Preview:** See your changes instantly as you adjust properties.
-   **Precise Controls:** Fine-tune every aspect of your shadow, including X/Y offsets, blur, spread, color, and inset.
-   **Beautiful Presets:** Get started quickly with a curated library of pre-designed, modern shadows.
-   **Drag & Drop Reordering:** Easily re-arrange shadow layers to achieve the perfect effect.
-   **One-Click Code Generation:** Copy the generated CSS `box-shadow` rule to your clipboard with a single click.
-   **Minimalist & Responsive UI:** A clean, intuitive, and fully responsive interface that works flawlessly on any device.

## Technology Stack

-   **Framework:** [React](https://react.dev/) (with Vite)
-   **State Management:** [Zustand](https://zustand-demo.pmnd.rs/)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
-   **Drag & Drop:** [@dnd-kit](https://dndkit.com/)
-   **Animations:** [Framer Motion](https://www.framer.com/motion/)
-   **Icons:** [Lucide React](https://lucide.dev/)
-   **Deployment:** [Cloudflare Workers](https://workers.cloudflare.com/)

## Getting Started

Follow these instructions to get a local copy of the project up and running for development and testing purposes.

### Prerequisites

You need to have [Bun](https://bun.sh/) installed on your machine.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/umbra-shadow-designer.git
    cd umbra-shadow-designer
    ```

2.  **Install dependencies:**
    ```bash
    bun install
    ```

3.  **Run the development server:**
    ```bash
    bun run dev
    ```

The application should now be running on `http://localhost:3000`.

## Available Scripts

This project comes with several pre-configured scripts to help with development:

-   `bun run dev`: Starts the Vite development server with hot-reloading.
-   `bun run build`: Builds the application for production.
-   `bun run lint`: Lints the codebase using ESLint.
-   `bun run preview`: Serves the production build locally for previewing.
-   `bun run deploy`: Deploys the application to Cloudflare Workers.

## Deployment

This application is designed to be deployed seamlessly to the Cloudflare global network.

### One-Click Deploy

You can deploy your own version of this project with a single click.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/rgsbsogt/generated-app-20250929-231132)

### Manual Deployment

1.  **Log in to Cloudflare:**
    If you haven't already, authenticate Wrangler with your Cloudflare account.
    ```bash
    wrangler login
    ```

2.  **Build the project:**
    ```bash
    bun run build
    ```

3.  **Deploy the application:**
    ```bash
    bun run deploy
    ```

Wrangler will build and deploy your application. After it's finished, it will provide you with the URL to your live site.

## Contributing

Contributions are welcome! If you have suggestions for improving the application, please feel free to open an issue or submit a pull request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.