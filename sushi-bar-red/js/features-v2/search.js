/* ============================================================
   features-v2/search.js — поиск по меню (V2+)
   ============================================================ */

function initSearch() {
  const searchInput = $('#menuSearchInput');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    menuSearchQuery = e.target.value.trim();
    const clearBtn = $('#menuSearchClear');
    if (clearBtn) clearBtn.classList.toggle('is-visible', menuSearchQuery.length > 0);
    renderMenu();
  });

  const clearBtn = $('#menuSearchClear');
  if (clearBtn) clearBtn.addEventListener('click', () => {
    menuSearchQuery = '';
    searchInput.value = '';
    clearBtn.classList.remove('is-visible');
    renderMenu();
    searchInput.focus();
  });
}

window.initSearch = initSearch;