# CRUDGenerator
A siple php+mysql CRUD generator written in TypeScript 

## installing

### using npm
`npm i @dumbaspl/crudgenerator -g`

### from source
1. clone the repository
2. install all dependencies using npm
3. build with `npm run build`
4. install globally using `npm i -g`
5. run using `crudgenerator`

## usage
```
# crudgenerator -h
Usage: crudgenerator [options]

Options:
  -c, --config <file>       Configuration file (default: "config.json")
  -o, --output <directory>  Output directory
  -d, --database            Also generate database
  -f, --force               Force override files
  -v, --version             output the version number
  -h, --help                display help for command
```
example configuration can be found [here](./config.json)

## purpose
This project exists because i got mad the the fact that certain teaches at my school force us to do the same thing over and over again with very minimal changes.

## not about code quality
This project was meant as a quick and dirty way to not have to do the the same thing all the time.  
The code isn't documented and the overall readability is very bad.   
This is not my normal coding style, I just didn't want to spend any more time than nectary since it won't be used all that much anyway.