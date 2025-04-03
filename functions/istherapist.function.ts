import { McpFunction } from "./function";
import { z } from "zod";

export class IsTherapistFunction implements McpFunction {

    public name: string = "isTherapist";

    public description: string = "Return if the person with the given email address is a therapist at Home of Zen. \n" +
      "The tool returns the following data: \n" +
      "- Is the given email address from a therapist (isTherapist); \n" +
      "- The full name of the therapist, if the given email address is from a therapist (name); \n" +
      "- The email of the therapist, if the given email address is from a therapist (email); \n" +
      "- The phone number of the therapist, if the given email address is from a therapist (phone); \n" +
      "- The address of the therapist, if the given email address is from a therapist (address); \n" +
      "- The zipcode of the therapist, if the given email address is from a therapist (zip); \n" +
      "- The city of the therapist, if the given email address is from a therapist (city); \n";

    public inputschema = {
        type: "object",
        email: {
            type: "string",
            description: "The email address of the person you want to check if it is a therapist."
        },
        required: ["email"],
    };

    public zschema = { email: z.string() };

    public async handleExecution(args: any) {
        try {
            const apiKey = process.env.HOZ_API_KEY;
            if (!apiKey || apiKey.trim() === "") {
                throw new Error("No HOZ_API_KEY provided. Cannot authorize HoZ API.")
            }
            if (!args) {
                throw new Error("No email provided in parameters.")
            }
            const { email } = args;
            const response = await fetch("https://istherapistv2-illi72bbyq-uc.a.run.app?email=" + email, 
                {
                    method: "GET",
                    headers: {
                        "apiKey": process.env.HOZ_API_KEY
                    }
                } as RequestInit
            );
            const json: any = await response.json();
            const therapistInfo = json;
            const text = "isTherapist: " + (therapistInfo.isTherapist === true) + 
                ", name: " + therapistInfo.name + 
                ", email: " + therapistInfo.email + 
                ", phone: " + therapistInfo.phone +
                ", address: " + therapistInfo.address + 
                ", zip: " + therapistInfo.zip + 
                ", city: " + therapistInfo.city + 
                ", member: " + therapistInfo.member;
            const content = [{
                type: "text",
                text: text
            }];
            return {
                content: content,
                isError: false
            };
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