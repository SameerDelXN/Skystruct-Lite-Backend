// import dbConnect from "@/lib/dbConnect";
// import User from "@/models/User";
// import { NextResponse } from "next/server";

// export async function GET(req: Request) {
//   await dbConnect();
// //sample
//   const { searchParams } = new URL(req.url);
//   const token = searchParams.get("token");

//   if (!token)
//     return NextResponse.json({ success: false, message: "Missing verification token" }, { status: 400 });

//   const user = await User.findOne({ emailVerificationToken: token });

//   if (!user)
//     return NextResponse.json({ success: false, message: "Invalid or expired token" }, { status: 400 });

//   user.isEmailVerified = true;
//   user.emailVerificationToken = null;
//   await user.save();

//   return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/verified`);
// }


import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return new NextResponse(
      getErrorHTML("Missing verification token"),
      {
        status: 400,
        headers: { "Content-Type": "text/html" },
      }
    );
  }

  const user = await User.findOne({ emailVerificationToken: token });

  if (!user) {
    return new NextResponse(
      getErrorHTML("Invalid or expired token"),
      {
        status: 400,
        headers: { "Content-Type": "text/html" },
      }
    );
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = null;
  await user.save();

  return new NextResponse(getSuccessHTML(), {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });
}

function getSuccessHTML() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verified Successfully</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        
        .container {
          background: white;
          border-radius: 24px;
          padding: 60px 40px;
          max-width: 500px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          text-align: center;
          animation: slideUp 0.6s ease-out;
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .checkmark-circle {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 30px;
          animation: scaleIn 0.5s ease-out 0.2s both;
        }
        
        @keyframes scaleIn {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }
        
        .checkmark {
          width: 35px;
          height: 35px;
          border: 4px solid white;
          border-top: none;
          border-right: none;
          transform: rotate(-45deg);
          animation: checkmark 0.4s ease-out 0.4s both;
        }
        
        @keyframes checkmark {
          from {
            width: 0;
            height: 0;
          }
          to {
            width: 35px;
            height: 35px;
          }
        }
        
        h1 {
          font-size: 32px;
          font-weight: 700;
          color: #1a202c;
          margin-bottom: 16px;
          letter-spacing: -0.5px;
        }
        
        p {
          font-size: 16px;
          color: #718096;
          line-height: 1.6;
          margin-bottom: 32px;
        }
        
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-decoration: none;
          padding: 14px 32px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 16px;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }
        
        .button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }
        
        .button:active {
          transform: translateY(0);
        }
        
        @media (max-width: 480px) {
          .container {
            padding: 40px 24px;
          }
          
          h1 {
            font-size: 26px;
          }
          
          p {
            font-size: 15px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="checkmark-circle">
          <div class="checkmark"></div>
        </div>
        <h1>Email Verified!</h1>
        <p>Your email has been successfully verified. You can now access all features of your account.</p>
        <a href="${process.env.NEXT_PUBLIC_BASE_URL || '/'}" class="button">Go to Dashboard</a>
      </div>
    </body>
    </html>
  `;
}

function getErrorHTML(message: string) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verification Failed</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        
        .container {
          background: white;
          border-radius: 24px;
          padding: 60px 40px;
          max-width: 500px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          text-align: center;
          animation: slideUp 0.6s ease-out;
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .error-circle {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 30px;
          animation: scaleIn 0.5s ease-out 0.2s both;
        }
        
        @keyframes scaleIn {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }
        
        .error-x {
          width: 40px;
          height: 40px;
          position: relative;
        }
        
        .error-x::before,
        .error-x::after {
          content: '';
          position: absolute;
          width: 4px;
          height: 40px;
          background: white;
          border-radius: 2px;
          top: 0;
          left: 18px;
        }
        
        .error-x::before {
          transform: rotate(45deg);
        }
        
        .error-x::after {
          transform: rotate(-45deg);
        }
        
        h1 {
          font-size: 32px;
          font-weight: 700;
          color: #1a202c;
          margin-bottom: 16px;
          letter-spacing: -0.5px;
        }
        
        p {
          font-size: 16px;
          color: #718096;
          line-height: 1.6;
          margin-bottom: 32px;
        }
        
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
          text-decoration: none;
          padding: 14px 32px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 16px;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 15px rgba(245, 87, 108, 0.4);
        }
        
        .button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(245, 87, 108, 0.6);
        }
        
        @media (max-width: 480px) {
          .container {
            padding: 40px 24px;
          }
          
          h1 {
            font-size: 26px;
          }
          
          p {
            font-size: 15px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="error-circle">
          <div class="error-x"></div>
        </div>
        <h1>Verification Failed</h1>
        <p>${message}. Please try again or contact support if the problem persists.</p>
        <a href="${process.env.NEXT_PUBLIC_BASE_URL || '/'}" class="button">Back to Home</a>
      </div>
    </body>
    </html>
  `;
}