# UN Data Vizualization Challenge

For my final project in the Metis data science bootcamp, I chose to investigate HIV and AIDS data provided by the United Nations for their Millennium Development Goals data visualization challenge.

You can see the finished project on my website at [emilyschuch.com/UN-challenge](http://www.emilyschuch.com/UN-challenge/)

## In this repository:

### Analysis files
* 01_UNreshape: reads in the data from a Postgres database, unstacks the series I've chosen to work with, and merges in some additional variables downloaded from the World Bank.
* 02_UNexplore: uses plotting functions to look for trends among the available variables.
* 03_UNexplore: reshapes the data further, investigates percent change of some variables from previous year.
* 04_UNmodel: explores various predictive models, both linear and classification.


### Visualizations
The three main visualizations are:
* A line plot of the HIV incidence rate by region (un-line.js)
* A world map of the HIV incidence rate by country with a slider to view by year from 1990 to 2013 (un.js, d3.slider.js)
* A heat map of the 20 countries with the highest average HIV incidence rate from 1990 to 2013, by country and by year (un.js)


#### Technologies used:
* Amazon Web Services
* SQL
* Python (pandas, statsmodels, sklearn)
* Linear regression and classification models
* HTML / CSS
* D3.js
