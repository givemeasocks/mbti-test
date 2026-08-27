(function () {
  "use strict";

  var GROUP_INFO = {
    NT: {
      name: "NT 분석가",
      types: "INTJ · INTP · ENTJ · ENTP",
      badge: "badge-nt",
      page: "nt.html",
      desc: "원리와 논리를 이해해야 직성이 풀리는 전략가 타입이에요. 전체 구조를 먼저 파악하고, 효율적인 방법으로 파고드는 학습 스타일이 잘 맞아요."
    },
    NF: {
      name: "NF 외교관",
      types: "INFJ · INFP · ENFJ · ENFP",
      badge: "badge-nf",
      page: "nf.html",
      desc: "의미와 가치를 발견할 때 몰입도가 폭발하는 이상주의자 타입이에요. 스토리와 감정을 활용한 학습, 좋아하는 사람과 함께하는 공부가 효과적이에요."
    },
    SJ: {
      name: "SJ 관리자",
      types: "ISTJ · ISFJ · ESTJ · ESFJ",
      badge: "badge-sj",
      page: "sj.html",
      desc: "계획과 체계 속에서 안정감을 느끼는 성실한 실무형 타입이에요. 꾸준한 반복과 촘촘한 일정 관리로 탄탄한 기본기를 쌓는 것이 강점이에요."
    },
    SP: {
      name: "SP 탐험가",
      types: "ISTP · ISFP · ESTP · ESFP",
      badge: "badge-sp",
      page: "sp.html",
      desc: "직접 부딪히고 몸으로 익힐 때 가장 빠르게 이해하는 실전형 타입이에요. 짧고 강한 몰입, 실전 감각을 살린 학습 방식이 잘 맞아요."
    }
  };

  var form = document.getElementById("quiz-form");
  var submitBtn = document.getElementById("submit-btn");
  var progressFill = document.getElementById("progress-fill");
  var progressText = document.getElementById("progress-text");
  var quizSection = document.getElementById("quiz-section");
  var resultArea = document.getElementById("result-area");
  var TOTAL = 10;

  function countAnswered() {
    var answered = 0;
    for (var i = 1; i <= TOTAL; i++) {
      if (form.querySelector('input[name="q' + i + '"]:checked')) answered++;
    }
    return answered;
  }

  function updateProgress() {
    var answered = countAnswered();
    var pct = Math.round((answered / TOTAL) * 100);
    progressFill.style.width = pct + "%";
    progressText.textContent = answered + " / " + TOTAL + " 문항 응답";
    submitBtn.disabled = answered < TOTAL;
  }

  form.addEventListener("change", updateProgress);
  updateProgress();

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (countAnswered() < TOTAL) return;

    var scores = { NT: 0, NF: 0, SJ: 0, SP: 0 };
    for (var i = 1; i <= TOTAL; i++) {
      var checked = form.querySelector('input[name="q' + i + '"]:checked');
      if (checked) scores[checked.value]++;
    }

    var maxScore = Math.max(scores.NT, scores.NF, scores.SJ, scores.SP);
    var topGroups = Object.keys(scores).filter(function (g) {
      return scores[g] === maxScore;
    });

    renderResult(scores, topGroups);

    if (typeof gtag === "function") {
      gtag("event", "test_complete", { group: topGroups[0].toLowerCase() });
    }

    quizSection.style.display = "none";
    resultArea.classList.add("show");
    resultArea.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  function renderResult(scores, topGroups) {
    var primary = GROUP_INFO[topGroups[0]];
    var badgeEl = document.getElementById("result-badge");
    var titleEl = document.getElementById("result-title");
    var descEl = document.getElementById("result-desc");
    var goBtn = document.getElementById("result-go-btn");

    badgeEl.className = "result-badge " + primary.badge;

    if (topGroups.length === 1) {
      badgeEl.textContent = topGroups[0];
      titleEl.textContent = "당신은 " + primary.name + " 타입!";
      descEl.textContent = primary.desc + " (" + primary.types + ")";
    } else {
      badgeEl.textContent = topGroups.join("/");
      var names = topGroups.map(function (g) { return GROUP_INFO[g].name; }).join(" · ");
      titleEl.textContent = names + " 복합 타입!";
      descEl.textContent = "두 가지 성향이 비슷하게 나타났어요. " + primary.desc;
    }

    goBtn.href = primary.page;
    goBtn.textContent = primary.name + " 공부법 보러가기 →";

    var barsWrap = document.getElementById("score-bars");
    barsWrap.innerHTML = "";
    ["NT", "NF", "SJ", "SP"].forEach(function (g) {
      var row = document.createElement("div");
      row.className = "score-row";
      var pct = Math.round((scores[g] / TOTAL) * 100);
      row.innerHTML =
        '<span class="label">' + g + '</span>' +
        '<span class="bar-bg"><span class="bar-fill ' + GROUP_INFO[g].badge + '" style="width:' + pct + '%"></span></span>' +
        '<span>' + scores[g] + '</span>';
      barsWrap.appendChild(row);
    });
  }

  document.getElementById("retry-btn").addEventListener("click", function () {
    form.reset();
    updateProgress();
    resultArea.classList.remove("show");
    quizSection.style.display = "";
    quizSection.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  var shareBtn = document.getElementById("share-btn");
  var toast = document.getElementById("toast");

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(function () { toast.classList.remove("show"); }, 2200);
  }

  shareBtn.addEventListener("click", function () {
    var shareData = {
      title: "MBTI 공부법 연구소",
      text: "나의 공부 유형을 찾아봤어요! 너도 한번 해볼래?",
      url: location.origin + location.pathname.replace(/test\.html$/, "") + "test.html"
    };
    if (navigator.share) {
      navigator.share(shareData).catch(function () {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(shareData.url).then(function () {
        showToast("링크가 복사되었어요! 친구에게 공유해보세요 📋");
      }).catch(function () {
        showToast("복사에 실패했어요. 주소창 URL을 직접 공유해주세요.");
      });
    } else {
      showToast("이 브라우저에서는 자동 공유가 지원되지 않아요.");
    }
  });
})();
