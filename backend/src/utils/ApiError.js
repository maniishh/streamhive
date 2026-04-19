class ApiError extends Error {   // Creating a custom error class that extends the built-in JavaScript Error class

    constructor(                 // Constructor runs automatically when we create a new ApiError object
        statusCode,              // HTTP status code (e.g., 400, 401, 404, 500)
        message = "Something went wrong",  // Default error message if none is provided
        error = [],              // Array to store detailed error information (like validation errors)
        stack = ""               // Optional custom stack trace
    ){
        super(message)           // Calls parent (Error) constructor and sets the error message properly

        this.statusCode = statusCode   // Store HTTP status code inside the error object

        this.data = null              // Error responses usually don't send data, so set it to null for consistency

        this.message = message        // Store readable error message

        this.success = false;         // Since this is an error, success is always false

        this.errors = error           // Store detailed error array (useful for validation or multiple errors)

        if (stack) {                  // If a custom stack trace is provided
            this.stack = stack        // Use the provided stack trace
        } else {
            Error.captureStackTrace(this, this.constructor)
            // Automatically generate a clean stack trace
            // Excludes constructor call from the stack for cleaner debugging
        }
    }
}

export { ApiError }   // Exporting the class so it can be used in other files (like controllers or middleware)