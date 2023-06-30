let jsonData;

async function fetchData() {
  try {
    const response = await fetch('trains.json');
    const data = await response.json();
    jsonData = data;
    console.log(data)
  } catch (error) {
    console.error('Error:', error);
  }
}

document.addEventListener('DOMContentLoaded', fetchData);

document.getElementById('from').addEventListener('input', function() {
  performSearch('from', 'fromresult', populateInput);
});

document.getElementById('to').addEventListener('input', function() {
  performSearch('to', 'toresult', populateInput);
});

function performSearch(inputId, resultsId, populateInputFn) {
  const inputText = document.getElementById(inputId);
  const searchTerm = inputText.value.toLowerCase();
  const results = document.getElementById(resultsId);
  results.innerHTML = '';

  if (!jsonData) {
    alert('Data not loaded yet!');
    return;
  }

  const matchingTrains = jsonData.features.filter(train =>
    train.properties[inputId + '_station_name'].toLowerCase().startsWith(searchTerm)
  );

  const fragment = document.createDocumentFragment();
  const existingOptions = new Set();

  matchingTrains.forEach(train => {
    const optionValue = train.properties[inputId + '_station_name'];
    if (!existingOptions.has(optionValue)) {
      const li = document.createElement('li');
      li.textContent = optionValue;
      li.addEventListener('click', function() {
        populateInputFn(inputId, optionValue);
        clearResults(resultsId);
      });
      fragment.appendChild(li);
      existingOptions.add(optionValue);
    }
  });

  results.appendChild(fragment);

  results.style.display = matchingTrains.length > 0 ? 'block' : 'none';
}

function populateInput(elementId, value) {
  document.getElementById(elementId).value = value;
}

function clearResults(resultsId) {
  const results = document.getElementById(resultsId);
  results.innerHTML = '';
}

async function srch() {
  if (!jsonData) {
    await fetchData();
  }

  const input = document.getElementById('numb').value;
  const matchingTrains = jsonData.features.filter(train =>
    train.properties.number.startsWith(input)
  );

  const fragment = document.createDocumentFragment();
  const existingOptions = new Set();
  const resultsId = document.getElementById('getr');

  matchingTrains.slice(0, 10).forEach(train => {
    const optionValue = train.properties.number;
    if (!existingOptions.has(optionValue)) {
      const li = document.createElement('li');
      li.textContent = optionValue;
      li.addEventListener('click', function() {
        populateInput('numb', optionValue);
        clearResults('getr');
      });
      fragment.appendChild(li);
      existingOptions.add(optionValue);
    }
  });

  resultsId.innerHTML = ''; 
  resultsId.appendChild(fragment);

  resultsId.style.display = matchingTrains.length > 0 ? 'block' : 'none';
}

document.getElementById('numb').addEventListener('input', srch);

document.getElementById('submitbtn').addEventListener('click', async function(event) {
  event.preventDefault();
  await matcher();
});

document.getElementById('getbynum').addEventListener('click', async function(event) {
  event.preventDefault();
  await getTrainDetails();
});

async function matcher() {
  try {
    if (!jsonData) {
      await fetchData();
    }

    const from = document.getElementById('from').value.toLowerCase();
    const to = document.getElementById('to').value.toLowerCase();

    if (!from || !to) {
      alert('Please enter both "From" and "To" stations.');
      return;
    }

    const matchingTrains = jsonData.features.filter(
      train =>
        (train.properties.from_station_name.toLowerCase() === from &&
          train.properties.to_station_name.toLowerCase() === to) ||
        (train.properties.from_station_name.toLowerCase() === to &&
          train.properties.to_station_name.toLowerCase() === from)
    );

    if (matchingTrains.length > 0) {
      let html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Train Details</title>
            <style>
                body {
                  background-image: linear-gradient(to top, #9890e3 0%, #b1f4cf 100%);
                  background-size: cover;
                  background-position: center;
                  
                  color: #333;
                  font-family: Arial, sans-serif;
                  padding: 20px;
                }
                
                h1 {
                  text-align: center;
                  margin-bottom: 20px;
                  color: #FFF;
                }
                
                .back-link {
                  position: fixed;
                  top: 20px;
                  left: 20px;
                  padding: 5px 10px;
                  background-color: #FFF;
                  border-radius: 5px;
                  text-decoration: none;
                  color: #333;
                  font-size: 14px;
                  transition: all 0.3s ease;
                }
                
                .back-link:hover {
                  transform: scale(1.05);
                  background-color: #55b4b0;
                }
                
                .train-details {
                  background-color: #FFF;
                  border-radius: 5px;
                  padding: 20px;
                  margin-bottom: 20px;
                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                  
                }
                
                .train-details:hover {
                  background-color: #F8F9FA;
                  
                }
                
                .train-details p {
                  margin: 0;
                  line-height: 1.5;
                  color: #333;
                }
                
                
              </style>
              

        </head>
        <body>
            <h1>Train Details</h1>
            <a href="Railroute.html" class="back-link">Back</a>
      `;

      matchingTrains.forEach(train => {
        const properties = train.properties;
        html += `
          <div class="train-details">
            <p>Train Name: ${properties.name}</p>
            <p>From: ${properties.from_station_name}</p>
            <p>To: ${properties.to_station_name}</p>
            <p>Train Number: ${properties.number}</p>
            <p>Arrival: ${properties.arrival}</p>
            <p>Departure: ${properties.departure}</p>
            <p>Travel Time: ${properties.duration_h} hours ${properties.duration_m} mins </p>
          </div>
        `;
      });

      html += `
        </body>
        </html>
      `;

      const newWindow = window.open('', '_self');
      newWindow.document.write(html);
      newWindow.document.close();
    } else {
      console.log('No matching trains found.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

async function getTrainDetails() {
  try {
    const trainNumber = document.getElementById('numb').value;

    if (!jsonData) {
      await fetchData();
    }

    if (!trainNumber) {
      alert('Please enter a train number.');
      return;
    }

    const matchingTrains = jsonData.features.filter(
      train => train.properties.number === trainNumber
    );

    if (matchingTrains.length > 0) {
      let html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Train Details</title>
            <style>
                body {
                  background-image: linear-gradient(to top, #9890e3 0%, #b1f4cf 100%);        
                  background-size: cover;
                  background-position: center;       
                  color: #333;
                  font-family: Arial, sans-serif;
                  padding: 20px;
                }
                
                h1 {
                  text-align: center;
                  margin-bottom: 20px;
                  color: #333;
                }
                
                .back-link {
                  position: fixed;
                  top: 20px;
                  left: 20px;
                  padding: 5px 10px;
                  background-color: #FFF;
                  border-radius: 5px;
                  text-decoration: none;
                  color: #333;
                  font-size: 14px;
                  transition: all 0.3s ease;
                }
                
                .back-link:hover {
                  transform: scale(1.05);
                  background-color: #55b4b0;
                }
                
                .train-details {
                  background-color: #FFF;
                  border-radius: 5px;
                  padding: 20px;
                  margin-bottom: 20px;
                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                  
                }
                
                .train-details:hover {
                  background-color: #F8F9FA;
                  
                }
                
                .train-details p {
                  margin: 0;
                  line-height: 1.5;
                  color: #333;
                }
                
                
              </style>


        </head>
        <body>
            <h1>Train Details</h1>
            <a href="Railroute.html" class="back-link">Back</a>
      `;

      matchingTrains.forEach(train => {
        const properties = train.properties;
        html += `
          <div class="train-details">
            <p>Train Name: ${properties.name}</p>
            <p>From: ${properties.from_station_name}</p>
            <p>To: ${properties.to_station_name}</p>
            <p>Arrival: ${properties.arrival}</p>
            <p>Departure: ${properties.departure}</p>
            <p>Travel Time: ${properties.duration_h} hours ${properties.duration_m} mins </p>
          </div>
        `;
      });

      html += `
        </body>
        </html>
      `;

      const newWindow = window.open('', '_self');
      newWindow.document.write(html);
      newWindow.document.close();
    } 
    else {
      alert('Train not found.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}
