const links = [
  "https://cursor.com/referral?code=XFPBBRLPG2OB",
  "https://cursor.com/referral?code=E9GSPSSITWD",
  "https://cursor.com/referral?code=QHLTHVGFJQLP",
  "https://cursor.com/referral?code=VGJP5CDJI7C",
  "https://cursor.com/referral?code=Y4B8SNAPKCKJ",
  "https://cursor.com/referral?code=QNR8XJIHFIRB",
  "https://cursor.com/referral?code=L0W8CDHAHTS",
  "https://cursor.com/referral?code=ZHW2LIOEYVM",
  "https://cursor.com/referral?code=VC8GO0LOII8S",
];

// 依次请求每个链接并检查内容是否包含 "Claim your"
async function checkLinks() {
  const results = [];

  for (const link of links) {
    try {
      const code = link.split("code=")[1];
      console.log(`正在检查链接: ${link}`);

      const response = await fetch(
        "https://www.cursor.com/api/dashboard/check-referral-code",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
          },
          body: JSON.stringify({ referralCode: code }),
        }
      );

      const data = await response.json();

      if (data && data.isValid) {
        console.log(`✅ 有效的推荐码: ${link}`);
        results.push(link);
      } else {
        console.log(`❌ 无效的推荐码: ${link}`);
      }
    } catch (error) {
      console.error(`请求链接时出错: ${link}`, error);
    }
  }

  console.log("有效的推荐链接:");
  results.forEach((link) => console.log(link));

  return results;
}

// 执行检查
checkLinks();
