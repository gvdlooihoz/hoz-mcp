import { McpFunction } from "./function";

export class RegisterEventFunction implements McpFunction {

    public name: string = "registerEvent";

    public description: string = "Register a customer for one of the events given at Home of Zen." +
      "The tool returns the following data:" +
      "- Success, when the registration was succesful" + 
      "- An error, when the registration was not succesful" + 
      "The reservation system of Home of Zen will confirm the reservation by e-mail.";
    public inputschema = {
        type: "object",
        eventDate: {
            type: "string",
            description: "The date of the event that the customer will be registered for in yyyy-MM-dd format. i.e. '2025-03-28'."
        },
        eventId: {
            type: "string",
            description: "The id of the event that the customer will be registered for. The event id is available from the getSchedule tool."
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
        required: ["eventDate, eventId, name, email"],
    }

    private HOZ_API_KEY: string | undefined;

    constructor() {
        this.HOZ_API_KEY = process.env.HOZ_API_KEY;
        if (!this.HOZ_API_KEY) {
            console.error("Error: HOZ_API_KEY environment variable is required");
            process.exit(1);
        }
    }

    public async handleExecution(request: any) {
        const { name, arguments: args } = request.params;
    
        if (!args) {
            throw new Error("No arguments provided");
        }
    
        const { eventDate, eventId, customerName, email, phone } = args;
        const result = await this.registerLesson(eventDate as string, eventId as string, customerName as string, email as string, phone as string);
        return result;
    }

    private async registerLesson(eventDate: string, eventId: string, name: string, email: string, phone: string): Promise<any> {
        const date = eventDate.replace('-', '');
        const body = {
            eventDates: [date],
            eventId: eventId,
            name: name,
            email: email,
            phone: phone
        }
        const response = await fetch("https://registereventv2-illi72bbyq-uc.a.run.app", 
            {
                method: "POST",
                headers: {
                    "apiKey": this.HOZ_API_KEY
                },
                body: JSON.stringify(body)
            } as RequestInit
        );
        const json: any = await response.json();
        if (json.registrationDate) {
            return { 
                content: [{
                    type: "text",
                    text: "Success"
                }],
                isError: false
            }
        } else {
            return { 
                content: [{
                    type: "text",
                    text: "Error: Registration for lesson was not successful.",
                }],
                isError: true
            }
        }

    }
}