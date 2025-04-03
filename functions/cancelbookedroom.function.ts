import { ApiKeyManager } from "./apikeymanager.js";
import { McpFunction } from "./function";
import { z } from "zod";

export class CancelBookedRoomFunction implements McpFunction {

    public name: string = "cancelBookedRoom";

    public description: string = "Cancel the reservation of a booked room at Home of Zen. \n" +
      "The tool returns the following data: \n" +
      "- Success, when the cancellation was succesful; \n" + 
      "- An error, when the cancellation was not succesful; \n" +
      "Room reservations are always in day parts. \n" +
      "The day parts are from 09:00 - 13:00, 13:30 - 17:30 and 18:00 - 22:00, every day of the week."

    public inputschema = {
        type: "object",
        email: {
            type: "string",
            description: "The e-mail address of the therapist that wants to cancel the booked room."
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

    public async handleExecution(args: any, extra: any) {
        try {
            const sessionId = extra.sessionId;
            let apiKey: string | undefined;
            if (sessionId) {
                apiKey = ApiKeyManager.getApiKey(sessionId);
                console.log("Api Key from ApiKeyManager: " + apiKey);
            } else {
                apiKey = process.env.HOZ_API_KEY;
                console.log("Api Key from environment variable: " + apiKey);
            }
            if (!apiKey || apiKey.trim() === "") {
                throw new Error("No HOZ_API_KEY provided. Cannot authorize HoZ API.")
            }
            if (!args) {
                throw new Error("No parameters provided for cancelBookedRoom tool.")
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
                    }],
                    isError: false
                }
            } else {
                if (json.error) {
                    throw new Error(json.error);
                } else {
                    throw new Error("Cancellation of booked room was not successful.");
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