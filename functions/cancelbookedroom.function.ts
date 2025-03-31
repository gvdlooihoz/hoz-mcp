import { McpFunction } from "./function";
import { z } from "zod";

export class CancelBookedRoomFunction implements McpFunction {

    public name: string = "cancelBookedRoom";

    public description: string = "Cancel the reservation of a booked room at Home of Zen ." +
      "The tool returns the following data:" +
      "- Success, when the cancellation was succesful" + 
      "- An error, when the cancellation was not succesful" +
      "Room reservations are always in day parts. The day parts are from 09:00 - 13:00, 13:30 - 17:30 and 18:00 - 22:00, every day of the week."

    public inputschema = {
        type: "object",
        email: {
            type: "string",
            description: "The e-mail address of the customer that wants to cancel the booked room."
        },
        date: {
            type: "string",
            description: "The date you want to cancel the booked room. In yyyy-MM-dd format, i.e. '2025-03-14'."
        },
        timeFrom: {
            type: "string",
            description: "The start time of the room reservation in hh:mm format, i.e. '09:00'."
        },
        timeTo: {
            type: "string",
            description: "The end time of tghe ropom reservation in hh:mm format, i.e. '13:00'."
        },
        roomId: {
            type: "string",
            description: "The id of the room. The id of the room can be obtained from the getAvailableRooms tool."
        },
        required: ["email, date, timeFrom, timeTo, roomId"],
    };

    public zschema = { email: z.string(), date: z.string(), timeFrom: z.string(), timeTo: z.string(), roomId: z.string() };

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
    
        const { email, date, timeFrom, timeTo, roomId } = args;
        const body = {
            email: email,
            date: date,
            timeFrom: timeFrom,
            timeTo: timeTo,
            roomId: roomId
        }
        const response = await fetch("https://cancelbookedroomv2-illi72bbyq-uc.a.run.app", 
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
                    text: "Error: Cancellation of booked room was not successful."
                }]
            }
        }
    }
}