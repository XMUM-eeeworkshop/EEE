document.addEventListener("DOMContentLoaded", async function () {
  const data = await fetch("course.json").then((response) => response.json());
  const courseContainer = document.querySelector(".course-container");
  const searchInput = document.querySelector(".search-input");
  const suggestionsBox = document.querySelector(".suggestions");

  // 获取当前页面的年级，例如从 "year1.html" 中提取出 "1"
  const currentGrade = parseInt(
    window.location.pathname.match(/year(\d)/)[1],
    10
  );

  // 筛选出当前页面的年级课程
  const currentGradeCourses = data.filter(
    (course) => course.grade === currentGrade
  );

  // 动态创建课程块
  currentGradeCourses.forEach((course) => {
    const semester = `Semester ${course.term}`;
    const referencesHTML = course.references
      .map((ref) =>
        ref.link
          ? `<a href="${ref.link}" target="_blank">${ref.title}</a>`
          : `<span>${ref.title}</span>`
      )
      .join("<br>");

    const readingsHTML = course.readings
      .map((reading) =>
        reading.link
          ? `<a href="${reading.link}" target="_blank">${reading.title}</a>`
          : `<span>${reading.title}</span>`
      )
      .join("<br>");

    const toolsHTML = course.tools
      .map((tool) =>
        tool.link
          ? `<a href="${tool.link}" target="_blank">${tool.title}</a>`
          : `<span>${tool.title}</span>`
      )
      .join("<br>");

    const courseSection = document.createElement("div");
    courseSection.classList.add("course-section");
    courseSection.setAttribute("data-semester", semester);
    courseSection.innerHTML = `
      <div class="course-header">
        <div class="course-info">
          <img class="course-image" src="${course.image}" alt="Course Image" />
          <h1 class="course-title">${course.code} ${course.name}</h1>
        </div>
        <button class="toggle-button">Show details</button>
      </div>
      <div class="expandable-content">
        <p><strong>Reference Books:</strong><br>${referencesHTML}</p>
        <p><strong>Further Readings:</strong><br>${readingsHTML}</p>
        <p><strong>Tools Needed:</strong><br>${toolsHTML}</p>
      </div>
    `;
    courseContainer.appendChild(courseSection);
  });

  // 全局搜索功能
  searchInput.addEventListener("input", function () {
    const query = searchInput.value.toLowerCase();
    suggestionsBox.innerHTML = "";
    if (query) {
      const filteredCourses = data.filter(
        (course) =>
          course.name.toLowerCase().includes(query) ||
          course.code.toLowerCase().includes(query)
      );
      filteredCourses.forEach((course) => {
        const suggestion = document.createElement("div");
        suggestion.textContent = `Year ${course.grade}, Semester ${course.term} - ${course.code} ${course.name}`;

        suggestion.addEventListener("click", () => {
          const targetURL = `year${course.grade}.html?term=${course.term}&code=${course.code}`;
          window.location.href = targetURL;
        });

        suggestionsBox.appendChild(suggestion);
      });
      suggestionsBox.style.display = "block";
    } else {
      suggestionsBox.style.display = "none";
    }
  });

  // 点击搜索框外部时隐藏建议框
  document.addEventListener("click", function (e) {
    if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
      suggestionsBox.style.display = "none";
    }
  });

  // 展开和折叠功能
  function setupToggleButtons() {
    document.querySelectorAll(".toggle-button").forEach((button) => {
      button.addEventListener("click", function () {
        const expandableContent = this.parentElement.nextElementSibling;
        if (expandableContent.style.maxHeight) {
          expandableContent.style.maxHeight = null;
          this.textContent = "Show details";
        } else {
          expandableContent.style.maxHeight =
            expandableContent.scrollHeight + "px";
          this.textContent = "Hide details";
        }
      });
    });
  }
  setupToggleButtons();

  // 默认显示第一个学期的课程
  const paginationLinks = document.querySelectorAll(".pagination a");
  paginationLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      if (link.textContent.trim() === "Homepage") return;

      e.preventDefault();
      paginationLinks.forEach((el) => el.classList.remove("active"));
      this.classList.add("active");

      const selectedSemester = this.textContent.trim();
      document.querySelectorAll(".course-section").forEach((section) => {
        section.style.display =
          section.getAttribute("data-semester") === selectedSemester
            ? "block"
            : "none";
      });
    });
  });

  document.querySelector(".pagination a.active").click();

  // URL 参数自动展开对应课程
  const urlParams = new URLSearchParams(window.location.search);
  const term = urlParams.get("term");
  const code = urlParams.get("code");

  if (term && code) {
    paginationLinks.forEach((link) => {
      if (link.textContent.trim() === `Semester ${term}`) {
        link.classList.add("active");
        link.click();
      }
    });

    const observer = new MutationObserver(() => {
      const targetCourse = Array.from(
        document.querySelectorAll(".course-section")
      ).find((course) =>
        course.querySelector(".course-title").textContent.includes(code)
      );

      if (targetCourse) {
        targetCourse.scrollIntoView({ behavior: "smooth", block: "center" });
        const toggleButton = targetCourse.querySelector(".toggle-button");
        if (toggleButton.textContent === "Show details") toggleButton.click();
        observer.disconnect();
      }
    });
    observer.observe(document.querySelector(".course-container"), {
      childList: true,
      subtree: true,
    });
  }
  paginationLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      if (link.textContent.trim() === "Homepage") return;

      e.preventDefault();
      window.scrollTo(0, 0); // 添加此行代码使页面滚动到顶部
      paginationLinks.forEach((el) => el.classList.remove("active"));
      this.classList.add("active");

      const selectedSemester = this.textContent.trim();
      document.querySelectorAll(".course-section").forEach((section) => {
        section.style.display =
          section.getAttribute("data-semester") === selectedSemester
            ? "block"
            : "none";
      });
    });
  });
});
