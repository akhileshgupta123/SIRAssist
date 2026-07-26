# Electoral Roll Sample Datasets

This folder contains sample draft electoral roll datasets for testing the **Electoral Roll SIR Verification Platform**.

## Files Included

1. `draft_electoral_roll_sample.csv`: A CSV file containing voter records with various Special Intensive Revision (SIR) anomaly categories (Demographic Matches, EPIC ID duplicates, Photo Hash matches, and Address Clusters).
2. `draft_electoral_roll_sample.json`: A structured JSON file format for batch API ingestion.

## How to Use in the Platform

1. In the top navigation bar of the web app, click **Upload Voter List**.
2. Either drag & drop or select `sample_data/draft_electoral_roll_sample.csv` or `sample_data/draft_electoral_roll_sample.json`.
3. Alternatively, click **Load Sample Test CSV** directly in the modal.
4. Click **Ingest Records with Gemini AI** to execute automated Gemini 3.6 Flash duplicate voter detection and risk scoring.
