const makeAdhanAPICall = async () => {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    const date = `${day < 10 ? '0' + day : day}-${month < 10 ? '0' + month : month}-${year}`;
    const coordinates = "?latitude=33.201662695006874&longitude=-97.14494994434574&method=2";
    console.log("Date being recieved is: " + date);
    const apiUrl = `https://api.aladhan.com/v1/timings/date=${date}${coordinates}`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            console.log("Error from Adhans! Status:", response.status);
            return;
        }
        const data = await response.json();
        console.log("Satisfactory response received from Adhans.");
        console.log(JSON.stringify(data.data.timings, null, 2));
    } catch (e) {
        console.error("API Error:", e);
    }
};

makeAdhanAPICall();
