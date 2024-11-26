// Setup dropdown for search suggestions
const setupDropdownForInput = (inputElement) => {
  const dropdown = document.createElement("ul");
  dropdown.classList.add("dropdown-menu", "bg-white", "shadow", "rounded-lg");
  dropdown.style.position = "absolute";
  dropdown.style.zIndex = "1000";
  dropdown.style.width = `${inputElement.offsetWidth}px`;
  document.body.appendChild(dropdown);

  const fetchQueriedAnime = async (query) => {
    if (query.trim() === "") {
      dropdown.innerHTML = "";
      return;
    }

    try {
      const response = await fetch(
        `https://api.jikan.moe/v4/anime?q=${query}&limit=5`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch anime data");
      }

      const data = await response.json();
      updateDropdown(data.data);
    } catch (error) {
      console.error("Error fetching anime:", error);
      dropdown.innerHTML =
        "<li class='p-2 text-red-500'>Error fetching results</li>";
    }
  };

  const updateDropdown = (animeList) => {
    dropdown.innerHTML = "";

    animeList.forEach((anime) => {
      const listItem = document.createElement("li");
      listItem.textContent = anime.title;
      listItem.classList.add("p-2", "cursor-pointer", "hover:bg-gray-200");

      // Click handler to select anime
      listItem.addEventListener("click", () => {
        inputElement.value = anime.title;
        dropdown.innerHTML = "";
      });

      dropdown.appendChild(listItem);
    });

    if (animeList.length === 0) {
      dropdown.innerHTML =
        "<li class='p-2 text-gray-500'>No results found</li>";
    }
  };

  // Update position dynamically
  const updateDropdownPosition = () => {
    const rect = inputElement.getBoundingClientRect();
    dropdown.style.top = `${rect.bottom + window.scrollY}px`;
    dropdown.style.left = `${rect.left + window.scrollX}px`;
    dropdown.style.width = `${rect.width}px`;
  };

  // Add input listener
  inputElement.addEventListener("input", (e) => {
    updateDropdownPosition();
    fetchQueriedAnime(e.target.value);
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!inputElement.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.innerHTML = "";
    }
  });
};

// Fetch a single anime by exact match
const fetchSingleAnime = async (query) => {
  try {
    const response = await fetch(`https://api.jikan.moe/v4/anime?q=${query}`);
    if (!response.ok) {
      throw new Error("Failed to fetch anime data");
    }

    const data = await response.json();

    // Filter results for an exact title match
    const exactMatch = data.data.find(
      (anime) => anime.title.toLowerCase() === query.toLowerCase()
    );

    if (exactMatch) {
      displayAnime(exactMatch);
    } else {
      console.error("No anime found with the exact name:", query);
      document.getElementById(
        "animeDisplay"
      ).innerHTML = `<p class="text-red-500">No anime found with the exact name: "${query}".</p>`;
    }
  } catch (error) {
    console.error("Error fetching anime:", error);
  }
};

// Fetch a random anime
const fetchRandomAnime = async () => {
  try {
    const response = await fetch(`https://api.jikan.moe/v4/random/anime`);
    if (!response.ok) {
      throw new Error("Failed to fetch random anime");
    }
    const data = await response.json();
    displayAnime(data.data);
  } catch (error) {
    console.error("Error fetching random anime:", error);
  }
};

// Display anime details
const displayAnime = (anime) => {
  const animeDisplay = document.getElementById("output");
  animeDisplay.style.display = "block";
  animeDisplay.innerHTML = `
        <h1 class="text-2xl font-bold text-center">${anime.title} (${
    anime.year || "N/A"
  })</h1>
        <h2 class="text-xl text-gray-600 text-center">${
          anime.title_english || "N/A"
        } / ${anime.title_japanese || "N/A"}</h2>
  
        <div class="outputContent">
          <img src="${anime.images.jpg.large_image_url}" alt="${
    anime.title
  }" class="w-100 h-auto rounded-md" />
          <div class="quickInfo">
            <p class="text-sm"><strong>Episodes:</strong> ${
              anime.episodes || "N/A"
            } / ${anime.duration || "N/A"}</p>
            <p class="text-sm">${
              anime.background ||
              "Unfortunately there's no recap for this Anime yet."
            }</p>
            <p class="text-xl">${anime.score || "N/A"}/10</p>
            <p class="text-l">voted by ${anime.scored_by || "N/A"}</p>
            <div class="flex flex-wrap gap-2 mt-2">
              ${anime.genres
                .map(
                  (genre) =>
                    `<span class="bg-blue-200 text-blue-800 px-2 py-1 rounded-md text-xs">${genre.name}</span>`
                )
                .join("")}
            </div>
          </div>
        </div>
  
        <div class="mt-4">
          <h3 class="text-lg font-semibold">Synopsis</h3>
          <p class="synopsis">${anime.synopsis || "N/A"}</p>
        </div>
    
    `;
  // Scroll to the #output element, accounting for sticky header
  const stickyHeaderHeight = document.querySelector("header").offsetHeight || 0;
  const offset =
    animeDisplay.getBoundingClientRect().top +
    window.scrollY -
    stickyHeaderHeight;

  window.scrollTo({
    top: offset,
    behavior: "smooth",
  });
};

// Attach dropdowns to inputs
setupDropdownForInput(document.getElementById("heroSearchInput"));
setupDropdownForInput(document.getElementById("navQuery"));

// Attach event listeners for search and random buttons
document
  .querySelector(".heroSearchBtns .btn-primary")
  .addEventListener("click", () => {
    const query = document.getElementById("heroSearchInput").value.trim();
    if (query) {
      fetchSingleAnime(query);
    } else {
      console.warn("Search input is empty");
      document.getElementById(
        "animeDisplay"
      ).innerHTML = `<p class="text-red-500">Please enter an anime name.</p>`;
    }
  });

document
  .querySelector(".heroSearchBtns .btn-secondary")
  .addEventListener("click", fetchRandomAnime);
