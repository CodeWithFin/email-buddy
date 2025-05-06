//api/aurinko/callback

import { exchangeCodeForAccessToken, getAccountDetails } from "@/lib/aurinko";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
    const {userId} = await auth();
    if (!userId) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }
    const params = request.nextUrl.searchParams;
    const status = params.get("status");
    if(status !== "success") {
        return NextResponse.json({error: "Failed to Link Account"}, {status: 401});   
    }
    //get the code to exchange for the access token
    const code = params.get("code");
    if(!code) {
        return NextResponse.json({error: "No code provided"}, {status: 400});
    }
    const token = await exchangeCodeForAccessToken(code);
    if(!token) {
        return NextResponse.json({error: "Failed to exchange code for access token"}, {status: 401});
    }

    const accountDetails = await getAccountDetails(token.accessToken);

    await db.account.upsert({
        where: {
            id: token.accountId.toString()
        },
        update: {
            accessToken: token.accessToken,
           
        },
        create: {  
            id: token.accountId.toString(),
            userId,
            emailAddress: accountDetails.email,
            name: accountDetails.name,
            accessToken: token.accessToken,
        }

    })

    return NextResponse.json({message: "Hello from Aurinko callback"}); 
}