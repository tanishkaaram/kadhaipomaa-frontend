export async function findMatch(

  username,

  interests

) {

  const response = await fetch(

    "http://localhost:8088/match",

    {

      method: "POST",

      headers: {

        "Content-Type":
          "application/json"

      },

      body: JSON.stringify({

        username,

        interests

      })

    }

  );

  return await response.json();
}