// ==UserScript==
// @name         自动填充表单
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  根据XPath自动填充
// @author       ydd
// @require      https://cdn.jsdelivr.net/jquery/1.7.2/jquery.min.js
// @match        http://10.64.16.115:58080/*
// @match        https://login.gientech.com/*
// @match        http://10.64.17.87:9101/*
// @run-at       document-end
// @grant        GM_xmlhttpRequest
// ==/UserScript==
(function() {
    'use strict';
    // 定义需要匹配的网站及对应的用户名、密码及其对应的 XPath
    const siteCredentials = {
        "http://x.x.x.x:x": {
            title:"jekins",
            username: "x",
            password: "x!x",
            usernameXPath: '/html/body/div/div/form/div[1]/input', // 修改为实际的 XPath
            passwordXPath: '/html/body/div/div/form/div[2]/input',  // 修改为实际的 XPath
            submitXPath: '/html/body/div/div/form/div[4]/button' // 提交按钮的 XPath，若需要自动提交则填写
        },
        "https://x.com":{
            title:"hub",
            username: "x",
            password: "x@",
            usernameXPath: '/html/body/div/div/div[2]/form/div/ul/li[1]/input', // 修改为实际的 XPath
            passwordXPath: '/html/body/div/div/div[2]/form/div/ul/li[2]/input',  // 修改为实际的 XPath
            capture:'/html/body/div/div/div[2]/form[1]/div/ul/li[3]/input',
            submitXPath: '/html/body/div/div/div[2]/form[1]/div/div[2]/button' // 提交按钮的 XPath，若需要自动提交则填写
        },
        "http://x":{
            title:"x",
            username: "x",
            password: "x",
            usernameXPath: '//*[@id="app"]/div/div[1]/div[2]/div/form/div[1]/div[1]/div/div/div[1]/input',
            passwordXPath: '/html/body/div[1]/div/div[1]/div[2]/div/form/div[1]/div[2]/div/div/div[1]/input',
            submitXPath: ''
        },
    };

    // 获取当前页面的URL
    const currentURL = window.location.href;
    // 验证码识别服务地址
    const ocrUrl = "http://x.x.x.x:x/recognize"

    // 函数：通过 XPath 定位元素
    function getElementByXPath(xpath) {
        return document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    }

    for (let site in siteCredentials) {
        if (currentURL.includes(site)) {
            const usernameInput = getElementByXPath(siteCredentials[site].usernameXPath);
            const passwordInput = getElementByXPath(siteCredentials[site].passwordXPath);

            if (usernameInput && passwordInput) {
                usernameInput.value = siteCredentials[site].username;
                passwordInput.value = siteCredentials[site].password;

                // 验证码处理
                handleCaptchaWithPolling(siteCredentials[site]).then(() => {
                    const submitButton = getElementByXPath(siteCredentials[site].submitXPath);
                    if (submitButton) {
                        submitButton.click(); // 确保验证码完成后再提交
                    } else {
                        console.log("提交按钮未找到");
                    }
                });
            } else {
                console.log("用户名或密码输入框未找到");
            }
            break;
        }
    }

    // 验证码处理逻辑（带轮询）
    function handleCaptchaWithPolling(siteConfig) {
        return new Promise((resolve) => {
            if (siteConfig.capture) {
                const maxRetries = 10; // 最大轮询次数
                let retryCount = 0;
                const interval = 500; // 每次轮询间隔时间（毫秒）

                const captchaImg = document.querySelector("#random-code-img");

                if (captchaImg) {
                    const checkCaptchaLoaded = setInterval(() => {
                        const base64 = captchaImg.src;

                        if (base64 && base64.startsWith("data:image")) {
                            clearInterval(checkCaptchaLoaded);

                            GM_xmlhttpRequest({
                                method: "POST",
                                url: ocrUrl,
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                data: JSON.stringify({ image: base64 }),
                                onload: function (response) {
                                    const data = JSON.parse(response.responseText);
                                    const capture = getElementByXPath(siteConfig.capture);
                                    if (capture) {
                                        capture.value = data.code;
                                    }
                                    console.log("验证码识别完成:", data.code);
                                    resolve();
                                },
                                onerror: function (error) {
                                    console.error("验证码识别错误:", error);
                                    resolve();
                                },
                            });
                        } else if (++retryCount >= maxRetries) {
                            clearInterval(checkCaptchaLoaded); // 停止轮询
                            console.error("验证码图片加载超时");
                            resolve();
                        }
                    }, interval);
                } else {
                    console.log("验证码图片未找到");
                    resolve();
                }
            } else {
                resolve();
            }
        });
    }

})();