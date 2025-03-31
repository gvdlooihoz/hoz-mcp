import { McpFunction } from "./function";
import { z } from "zod";

export class CancelBookedLessonFunction implements McpFunction {

    public name: string = "cancelBookedLesson";

    public description: string = "Cancel the reservation for a customer of a booked lesson at Home of Zen." +
      "The tool returns the following data:" +
      "- Success, when the cancellation was succesful" + 
      "- An error, when the cancellation was not succesful";

    public inputschema = {
        type: "object",
        email: {
            type: "string",
            description: "TThe e-mail address of the customer that wants to cancel the booked lesson."
        },
        date: {
            type: "string",
            description: "The date you want to cancel the booked lesson. In yyyy-MM-dd format, i.e. '2025-03-14'."
        },
        time: {
            type: "string",
            description: "The start time of the booked lesson you want to cancel. In hh:mm format, i.e. '09:00'."
        },
        required: ["email, date, time"],
    };

    public zschema = { email: z.string(), date: z.string(), time: z.string() };

    private HOZ_API_KEY: string | undefined;

    constructor() {
        this.HOZ_API_KEY = process.env.HOZ_API_KEY;
        if (!this.HOZ_API_KEY) {
            console.error("Error: HOZ_API_KEY environment variable is required");
            process.exit(1);
        }
    }

    public async handleExecution(args: any) {
        if (!args) {
            return {
                content: [{type: "text", text: "No arguments provided."}],
                isError: true
            };
        }
    
        const { email, date, time } = args;
        const body = {
            email: email,
            date: date,
            time: time
        }
        const response = await fetch("https://cancelbookedlessonv2-illi72bbyq-uc.a.run.app", 
            {
                method: "POST",
                headers: {
                    "apiKey": process.env.HOZ_API_KEY
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
                    text: "Error: Cancellation of booked lesson was not successful."
                }]
            }
        }
    }
}