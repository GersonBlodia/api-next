export const verifyEmailWithHunter = async (email: string) => {
  const res = await fetch(
    `https://api.hunter.io/v2/email-verifier?email=${email}&api_key=${process.env.HUNTER_API_KEY}`
  );
  const data = await res.json();
  console.log(data)
  return data.data?.result === 'deliverable';
};
         
