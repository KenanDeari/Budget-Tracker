let db;
// request for budget db created
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function (event) {
    const db = event.target.result;
    db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function (event) {
    db = event.target.result;

    // ensure app is online
    if (navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = function (event) {
    console.log("Woops! " + event.target.errorCode);
};

function saveRecord(record) {
    // create transaction on pending DB w/ readwrite access also
    const transaction = db.transaction(["pending"], "readwrite");
    // view all pending items in your object
    const store = transaction.objectStore("pending");
    // add all items to store record
    store.add(record);
}

function checkDatabase() {
    // create transaction on pending DB w/ readwrite access also
    const transaction = db.transaction(["pending"], "readwrite");
    // view all pending items in your object
    const store = transaction.objectStore("pending");
    // add all items to store record
    const getAll = store.getAll();



    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
                .then(response => response.json())
                .then(() => {
                    // delete records if successful
                    const transaction = db.transaction(["pending"], "readwrite");
                    const store = transaction.objectStore("pending");
                    // clear every item in your store
                    store.clear();
                });
        }
    };
}

// listen for app coming back online
window.addEventListener("online", checkDatabase);