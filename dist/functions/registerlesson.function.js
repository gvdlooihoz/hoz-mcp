export class RegisterLessonFunction {
    constructor() {
        this.name = "registerLesson";
        this.description = "Register a customer for one of the lessons given at Home of Zen." +
            "The tool returns the following data:" +
            "- Success, when the registration was succesful" +
            "- An error, when the registration was not succesful" +
            "The reservation system of Home of Zen will confirm the reservation by e-mail.";
        this.inputschema = {
            type: "object",
            lessonDate: {
                type: "string",
                description: "The date you want to register the lesson. In yyyy-MM-dd format, i.e. '2025-03-14'."
            },
            lessonId: {
                type: "string",
                description: "The id of the lesson that the customer will be registered for. The lesson id is available from the getSchedule tool."
            },
            name: {
                type: "string",
                description: "The full name of the customer that will be registered."
            },
            email: {
                type: "string",
                description: "The email address of the customer that will be registered."
            },
            phone: {
                type: "string",
                description: "The email address of the customer that will be registered."
            },
            required: ["lessonDate, lessonId, name, email"],
        };
        this.HOZ_API_KEY = process.env.HOZ_API_KEY;
        if (!this.HOZ_API_KEY) {
            console.error("Error: HOZ_API_KEY environment variable is required");
            process.exit(1);
        }
    }
    async handleExecution(request) {
        const { name, arguments: args } = request.params;
        if (!args) {
            throw new Error("No arguments provided");
        }
        const { lessonDate, lessonId, customerName, email, phone } = args;
        const result = await this.registerLesson(lessonDate, lessonId, customerName, email, phone);
        return result;
    }
    async registerLesson(lessonDate, lessonId, name, email, phone) {
        const body = {
            lessonDate: lessonDate,
            lessonId: lessonId,
            name: name,
            email: email,
            phone: phone
        };
        const response = await fetch("https://registerlessonv2-illi72bbyq-uc.a.run.app", {
            method: "POST",
            headers: {
                "apiKey": this.HOZ_API_KEY
            },
            body: JSON.stringify(body)
        });
        const json = await response.json();
        if (json.registrationDate) {
            return {
                content: [{
                        type: "text",
                        text: "Success"
                    }],
                isError: false
            };
        }
        else {
            return {
                content: [{
                        type: "text",
                        text: "Error: Registration for lesson was not successful.",
                    }],
                isError: true
            };
        }
    }
}
