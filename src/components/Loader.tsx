export const Loader = () => {
    return (
        <div className="flex h-screen items-center justify-center">
            <div role="status">
                <svg
                    aria-hidden="true"
                    className="h-8 w-8 animate-spin fill-blue-600 text-primary"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d=""
                        fill="currentColor"
                    />
                    <path
                        d=""
                        fill="currentFill"
                    />
                </svg>
                <span className="sr-only">Loading...</span>
            </div>
        </div>
    )
};
