for file in packages/*
do
  if test -d $file
  then
    (cd $file; yarn install)
  fi
done
yarn install
yarn ci
