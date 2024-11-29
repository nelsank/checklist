const axios = require('axios');
const express = require('express');
const app = express();
const PORT = 3000;

// Checklist Rules Configuration
const checklistRules = [
  {
    name: 'Valuation Fee Paid',
    condition: (data) => data.isValuationFeePaid === true,
  },
  {
    name: 'UK Resident',
    condition: (data) => data.isUkResident === true,
  },
  {
    name: 'Risk Rating Medium',
    condition: (data) => data.riskRating === 'Medium',
  },
  {
    name: 'LTV Below 60%',
    condition: (data) => {
      const ltv = (data.loanRequired / data.purchasePrice) * 100;
      return ltv < 60;
    },
  },
];

// Fetch Data from API
const fetchData = async () => {
  try {
    const response = await axios.get(
      'http://qa-gb.api.dynamatix.com:3100/api/applications/getApplicationById/67339ae56d5231c1a2c63639'
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
};

// Evaluate Rules
const evaluateChecklist = (data) => {
  return checklistRules.map((rule) => ({
    rule: rule.name,
    status: rule.condition(data) ? 'Passed' : 'Failed',
  }));
};

// Serve Dashboard
app.get('/', async (req, res) => {
  const data = await fetchData();
  if (!data) {
    return res.status(500).send('Failed to fetch data from API.');
  }

  const results = evaluateChecklist(data);

  // Render Results in a Simple HTML Dashboard
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Checklist Dashboard</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f4f4f4; }
          .passed { color: green; font-weight: bold; }
          .failed { color: red; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>Checklist Dashboard</h1>
        <table>
          <thead>
            <tr>
              <th>Rule</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${results
              .map(
                (result) => `
                  <tr>
                    <td>${result.rule}</td>
                    <td class="${result.status.toLowerCase()}">${result.status}</td>
                  </tr>
                `
              )
              .join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;

  res.send(html);
});

app.listen(PORT, () => {   
    console.log(`Server is running on http://localhost:${PORT}`);
  });
  