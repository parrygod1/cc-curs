gcloud functions deploy getDirections \
  --source https://source.developers.google.com/projects/disco-dispatch-307814/repos/cctema3/moveable-aliases/main/paths/maps/deploy \
  --runtime nodejs14 \
  --trigger-http \
  --entry-point getDirections
$SHELL