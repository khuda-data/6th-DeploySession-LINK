function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// 로컬 스토리지에서 UUID를 가져오거나 생성
function getUUID() {
  let uuid = localStorage.getItem("user_uuid");
  if (!uuid) {
    uuid = generateUUID();
    localStorage.setItem("user_uuid", uuid);
  }
  return uuid;
}

document.addEventListener("DOMContentLoaded", () => {
  const addButton = document.getElementById("add-button");
  const mylinksButton = document.getElementById("mylinks-button");
  const userUUID = getUUID();

  // 현재 탭의 URL을 가져와 Django 서버에 요청
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = tabs[0].url;

    fetch("http://218.209.109.43:8000/api/extract_from_url/", {
      // Django 서버의 공인 IP 주소 사용
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url, user_uuid: userUUID }), // user_uuid 추가
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        document.getElementById("title").innerText = data.title || "No Title";
        document.getElementById("description").innerText =
          data.summary || "No Summary";
        document.getElementById("thumbnail").src =
          data.image_url || "default-thumbnail.png";

        const keywordsDiv = document.getElementById("keywords");
        keywordsDiv.innerHTML = ""; // 기존 내용을 지움
        data.keywords.forEach((keyword) => {
          const keywordButton = document.createElement("button");
          keywordButton.className = "keyword-button";
          keywordButton.innerText = keyword;
          keywordsDiv.appendChild(keywordButton);
        });

        // "Add to My Links" 버튼 클릭 시 데이터 저장
        addButton.addEventListener("click", () => {
          const title = document.getElementById("title").innerText;
          const description = document.getElementById("description").innerText;
          const image_url = document.getElementById("thumbnail").src;
          const keywords = Array.from(
            document.getElementsByClassName("keyword-button")
          ).map((button) => button.innerText);

          fetch("http://218.209.109.43:8000/api/links/", {
            // Django 서버의 공인 IP 주소 사용
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              url,
              title,
              description,
              keywords,
              image_url,
              user_uuid: userUUID, // user_uuid 포함
            }),
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              return response.json();
            })
            .then((data) => {
              alert("당신의 마음속에 저장 완료♥");
            })
            .catch((error) => {
              console.error("Error adding link:", error);
            });
        });
      })
      .catch((error) => {
        console.error("Error fetching data from server:", error);
      });
  });

  // "My Links" 버튼 클릭 시 React 앱으로 이동
  mylinksButton.addEventListener("click", () => {
    window.open(`http://218.209.109.43:3000?user_uuid=${userUUID}`); // React 앱의 URL 사용
  });
});
