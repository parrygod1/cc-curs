gcloud functions deploy scrapProducts \
  --source https://source.developers.google.com/projects/disco-dispatch-307814/repos/cctema3/moveable-aliases/master/paths/scrapProducts \
  --runtime nodejs14 \
  --trigger-http \
  --entry-point scrapProducts


# gcloud builds submit --config ./cloudbuild.yaml