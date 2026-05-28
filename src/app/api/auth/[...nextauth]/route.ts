import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.googleIdToken = account.id_token;
        
        // Exchange Google ID Token for our Backend JWT
        try {
          const res = await fetch("http://localhost:8000/api/v1/auth/google", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ id_token: account.id_token }),
          });
          
          if (res.ok) {
            const data = await res.json();
            token.backendAccessToken = data.access_token;
          } else {
            console.error("Failed to exchange Google token with backend:", await res.text());
          }
        } catch (error) {
          console.error("Error exchanging token with backend:", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Pass the backend JWT to the client session
      (session as { backendAccessToken?: unknown }).backendAccessToken = token.backendAccessToken;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/", // Redirect to home page if sign in is required
  }
});

export { handler as GET, handler as POST };
