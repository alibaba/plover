for file in packages/*
do
  if test -d $file
  then
    (cd $file; npm install)
  fi
done
npm install
npm run ci
