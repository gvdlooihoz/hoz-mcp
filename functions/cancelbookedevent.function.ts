import { McpFunction } from "./function";
import { z } from "zod";

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
    };

    public zschema = { email: z.string(), date: z.string(), time: z.string() };

    public async handleExecution(args: any) {
        try {
            const apiKey = process.env.HOZ_API_KEY;
            if (!apiKey || apiKey.trim() === "") {
                throw new Error("No HOZ_API_KEY provided. Cannot authorize HoZ API.")
            }
            if (!args) {
                throw new Error("No parameters provided.")
            }
        
            const { email, date, time } = args;
            const body = {
                email: email,
                date: date,
                time: time
            }
            const response = await fetch("https://cancelbookedeventv2-illi72bbyq-uc.a.run.app", 
                {
                    method: "POST",
                    headers: {
                        "apiKey": apiKey
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
        } catch (error) {
            return { 
                content: [{
                    type: "text",
                    text: ("Error: " + error)
                }],
                isError: true
            }
        }
    }
}