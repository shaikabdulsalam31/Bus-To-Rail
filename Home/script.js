let jsonData = null;

async function fetchJsonData() {
  try {
    const response = await fetch('Home/data.json');
    jsonData = await response.json();
  } catch (error) {
    console.log(error);
    alert('An error occurred while fetching the data!');
  }
}

function populateInput(elementId, value) {
  document.getElementById(elementId).value = value;
}

function performSearch(inputId, resultsId, populateInputFn) {
  const inputText = document.getElementById(inputId);
  const searchTerm = inputText.value.toLowerCase();
  const results = document.getElementById(resultsId);
  results.innerHTML = '';

  if (!jsonData) {
    alert('Data not loaded yet!');
    return;
  }

  const addedResults = new Set();
  const matchingResults = [];

  jsonData.forEach(function (item) {
    const from = item.from;
    const to = item.to;
    const intermediates = Array.isArray(item.intermediate) ? item.intermediate.join(', ').toLowerCase() : '';

    if (from.toLowerCase().startsWith(searchTerm) || to.toLowerCase().startsWith(searchTerm) || intermediates.includes(searchTerm)) {
      let value = '';
      if (from.toLowerCase().startsWith(searchTerm)) {
        value = from;
      } else if (to.toLowerCase().startsWith(searchTerm)) {
        value = to;
      } else {
        value = item.intermediate.find(function (intermediate) {
          return intermediate.toLowerCase().includes(searchTerm);
        });
      }

      if (!addedResults.has(value)) {
        matchingResults.push(value);
        addedResults.add(value);
      }
    }
  });

  if (matchingResults.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'No results found';
    results.appendChild(li);
  } else {
    matchingResults.forEach(function (value) {
      const li = document.createElement('li');
      li.textContent = value;
      li.addEventListener('click', function () {
        populateInputFn(inputId, value);
        clearResults(resultsId);
      });
      results.appendChild(li);
    });
  }

  if (matchingResults.length > 0) {
    results.style.display = 'block';
  } else {
    results.style.display = 'none';
  }
}


function clearResults(resultsId) {
  const results = document.getElementById(resultsId);
  results.innerHTML = '';
  results.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', fetchJsonData);

document.getElementById('from').addEventListener('input', function () {
  performSearch('from', 'result', populateInput);
});

document.getElementById('dest').addEventListener('input', function () {
  performSearch('dest', 'toresult', populateInput);
});

document.getElementById('from').addEventListener('focus', function () {
  clearResults('result');
});

document.getElementById('dest').addEventListener('focus', function () {
  clearResults('toresult');
});


document.getElementById('submitbtn').addEventListener('click', async function (event) {
  event.preventDefault(); 
  const fromValue = document.getElementById('from').value;
  const toValue = document.getElementById('dest').value;

  if (!jsonData) {
    alert('Data not loaded yet!');
    return;
  }

  const details = findDetails(fromValue, toValue);
  if (details) {
    const queryString = `?field1=${encodeURIComponent(details.details)}&field2=${encodeURIComponent(details.busno)}&field3=${encodeURIComponent(details.fare)}&field4=${encodeURIComponent(details.intermediate)}&field5=${encodeURIComponent(details.frequency)}`;
    window.location.href = `Home/details.html${queryString}`;
  } else {
    alert('No details found for the given values!');
  }
});

function findDetails(from, to) {
  for (let i = 0; i < jsonData.length; i++) {
    const route = jsonData[i];
    const intermediates = Array.isArray(route.intermediate) ? route.intermediate : [];

    if ((route.from === from.trim() && route.to === to.trim()) ||
        (route.from === to.trim() && route.to === from.trim())) {
      return route;
    }

    if (intermediates.includes(from.trim()) && intermediates.includes(to.trim())) {
      return route;
    }

    if (intermediates.includes(from.trim()) && route.to === to.trim() || intermediates.includes(from.trim()) && route.from === to.trim()) {
      return route;
    }

    if (intermediates.includes(to.trim()) && route.from === from.trim() || intermediates.includes(to.trim()) && route.to=== from.trim()) {
      return route;
    }
  }

  return null;
}
