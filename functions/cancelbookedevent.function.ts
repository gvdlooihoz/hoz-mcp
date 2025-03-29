import { McpFunction } from "./function";

export class CancelBookedEventFunction implements McpFunction {

    public name: string = "cancelBookedEvent";

    public description: string = "Cancel the reservation for a customer of an event at Home of Zen." +
      "The tool returns the following data:" +
      "- Success, when the cancellation was succesful" + 
      "- An error, when the cancellation was not succesful";

    public inputschema = {
        type: "object",
        email: {
            type: "string",
            description: "The e-mail address of the customer that wants to cancel the booked event."
        },
        date: {
            type: "string",
            description: "The date you want to cancel the booked event. In yyyy-MM-dd format, i.e. '2025-03-14'."
        },
        time: {
            type: "string",
            description: "The start time of the booked event you want to cancel. In hh:mm format, i.e. '09:00'."
        },
        required: ["email, date, time"],
    }

    private HOZ_API_KEY: string | undefined;

    constructor() {
        this.HOZ_API_KEY = process.env.HOZ_API_KEY;
        if (!this.HOZ_API_KEY) {
            console.error("Error: HOZ_API_KEY environment variable is required");
            process.exit(1);
        }
    }

    public async handleExecution(request) {
        const { name, arguments: args } = request.params;
    
        if (!args) {
            throw new Error("No arguments provided");
        }
    
        const { email, date, time } = args;
        const result = await this.cancelBookedEvent(email as string, date as string, time as string);
        return result;
    }

    private async cancelBookedEvent(email: string, date: string, time: string): Promise<any> {
        const body = {
            email: email,
            date: date,
            time: time
        }
        const response = await fetch("https://cancelbookedeventv2-illi72bbyq-uc.a.run.app", 
            {
                method: "POST",
                headers: {
                    "apiKey": this.HOZ_API_KEY
                },
                body: JSON.stringify(body)
            } as RequestInit
        );
        const json: any = await response.json();
        if (json.result === "Success") {
            return { 
                content: [{
                    type: "text",
                    text: "Success"
                }]
            }
        } else {
            return { 
                content: [{
                    type: "text",
                    text: "Error: Cancellation of booked event was not successful."
                }]
            }
        }

    }
}