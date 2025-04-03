import { ApiKeyManager } from "./apikeymanager.js";
import { McpFunction } from "./function";
import { z } from "zod";

export class IsCustomerFunction implements McpFunction {

    public name: string = "isCustomer";

    public description: string = "Return if the person with the given email address is a customer at Home of Zen." +
      "The tool returns the following data:" +
      "- Is the given email address a customer (isCustomer);" +
      "- The first name of the customer, if the email address is a customer (firstName);" +
      "- The last name of the customer, if the email address is a customer (lastName);" +
      "- The email of the customer, if the email address is a customer (email);" +
      "- The phone number of the customer, if the email address is a customer (phone);" +
      "- Does the person has a subscription, if the email address is a customer (subscription);" +
      "- The amount of credits the customer has (credits)" +
      "A Zen is an internal digital payment method to pay for lessons, eventa and sessions. " + 
      "When a customer does not have a credit in Zen, it is possible to pay the therapist/teacher cash or by payment request by bank.";

    public inputschema = { 
        type: "object",
        email: {
            type: "string",
            description: "The email address of the person you want to check if it is a customer."
        },
        required: ["email"],
    };

    public zschema = { email: z.string() };

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
                throw new Error("No email provided in parameters.")
            }
            
            const { email } = args;
            const response = await fetch("https://iscustomerv2-illi72bbyq-uc.a.run.app?email=" + email, 
                {
                    method: "GET",
                    headers: {
                        "apiKey": process.env.HOZ_API_KEY
                    }
                } as RequestInit
            );
            const json: any = await response.json();
            const customerInfo = json;
            const text = "isCustomer: " + (customerInfo.isCustomer === true) + 
                ", firstName: " + customerInfo.firstName + 
                ", lastName: " + customerInfo.lastName + 
                ", email: " + customerInfo.email + 
                ", phone: " + customerInfo.phone +
                ", subscription: " + customerInfo.subscription + 
                ", credits: " + customerInfo.credits;
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