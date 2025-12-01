import { headers } from "next/headers";
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
    const headerPayload = await headers();

    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response("Error: Missing svix headers", { status: 400 });
    }

    //parse_body

    const body = await req.text();
    const payload = JSON.parse(body);

    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
        return new Response("Error: Missing webhook secret", { status: 500 });
    }

    const wh = new Webhook(webhookSecret);
    let evt: WebhookEvent;

    try {
        evt = wh.verify(body, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        }) as WebhookEvent;
    } catch (error) {
        return new Response("Error: Invalid webhook signature", { status: 400 });
    }

    const eventType = evt.type;
    if (eventType === "user.created" || eventType === "user.updated") {
        const { id, email_addresses, first_name, last_name, image_url } = evt.data;
        const primaryEmail = email_addresses[0]?.email_address;

        try {
            await connectDB()
            await User.findOneAndUpdate({ clerkId: id }, {
                clerkId: id,
                email: primaryEmail,
                firstName: first_name,
                lastName: last_name,
                imageUrl: image_url,
            }, {
                upsert: true,
                new: true
            })

        } catch (error) {
            return new Response("Error: syncing user to database", { status: 500 });

        }
    }

    return new Response('Webhook received',{status:200});
}
