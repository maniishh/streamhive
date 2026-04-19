class ApiResponse { 
    // Define a class to standardize all API success responses

    constructor(statusCode, data, message = "Success") { 
        // Constructor runs automatically when new ApiResponse() is called
        // statusCode → HTTP status code (200, 201, etc.)
        // data → actual response data (user, products, etc.)
        // message → readable message (default = "Success")

        this.statusCode = statusCode; 
        // Store the HTTP status code in the response object

        this.data = data; 
        // Store the actual data that needs to be sent to client

        this.message = message; 
        // Store a readable message for frontend display

        this.success = statusCode < 400; 
        // Automatically determine success:
        // If statusCode is less than 400 → success = true
        // If statusCode is 400 or more → success = false
        // (Because 4xx and 5xx are error codes in HTTP)
    }
}

export { ApiResponse };