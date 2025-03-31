import { McpFunction } from "./function";
import { z } from "zod";

export class GetAvailableRoomsFunction implements McpFunction {

    public name: string = "getAvailableRooms";

    public description: string = "Return the availability of rooms between the given start date (startDate, yyyy-MM-dd) and the given end date (endDate, yyyy-MM-dd)." +
      "The tool returns a collection of rooms with the aiablability for each daypart per date." +
      "Dayparts are from 09:00 - 13:00 (morning), 13:30 - 17:30 (afternoon), 18:00 - 22:00 (evening)" +
      "The following data will be returned:" +
      "- The identifier of the room (roomId);" +
      "- The name of the room (name);" +
      "- The price of the room in Euro (price);" +
      "- The date availability (date, in yyyy-MM-dd format);" +
      "- The day of the availability (day);" +
      "- A list of available dayparts (i.e. [09:00 - 13:00, 18:00 - 22:00]);";

    public inputschema: any = {
        type: "object",
        startDate: {
            type: "string",
            description: "The start date from when the room availability is retrieved in format yyyy-MM-dd."
        },
        endDate: {
            type: "string",
            description: "The end date until when the room availability is retrieved in format yyyy-MM-dd."
        },
        required: ["startDate, endDate"],
    };

    public zschema = { startDate: z.string(), endDate: z.string() };

    public HOZ_API_KEY: string | undefined = "";

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
                content: [{type: "text", text: "No start and end date provided as arguments."}],
                isError: true
            };
        }    
        const {startDate, endDate } = args;
        const response = await fetch("https://getavailableroomsv2-illi72bbyq-uc.a.run.app?startDate=" + startDate + "&endDate=" + endDate, 
            {
                method: "GET",
                headers: {
                    "apiKey": process.env.HOZ_API_KEY
                }
            } as RequestInit
        );
        const results: Array<any> = await response.json();
        const content: Array<any> = [];
        for (let i=0; i<results.length; i++) {
            const roomInfo = results[i];
            const availabilities: Array<any> = roomInfo.availability;
            for (let j=0; j<availabilities.length; j++) {
                const availability = availabilities[j];
                let dayParts = "[";
                let first = true;
                for (let k=0; k<availability.dayParts.length; k++) {
                    if (!first) {
                        dayParts = dayParts + ", ";
                    }
                    dayParts = dayParts + availability.dayParts[k];
                    first = false;
                }
                dayParts = dayParts + "]";
                const text = "roomId: " + roomInfo.roomId + ", name: " + roomInfo.name + ", price: " + roomInfo.price +
                ", date: " + availability.date + ", day: " + availability.day + ", dayparts:" + dayParts;
                content.push({
                    type: "text",
                    text: text
                });
            }
        }
        return {
            content: content,
            isError: false
        };
    }

}