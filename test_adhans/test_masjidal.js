const makeNewAdhanAPICall = async () => {
    const apiUrl = `https://masjidal.com/api/v1/time/range?masjid_id=O8L7ppA5`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            if (response.status === 404) {
                console.log("404 Error from Adhans!");
            } else {
                console.log("Error! Status:", response.status);
            }
            return;
        }
        const data = await response.json();
        console.log("Satisfactory response received from Adhans.");
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("API Error:", e);
    }
};

makeNewAdhanAPICall();
