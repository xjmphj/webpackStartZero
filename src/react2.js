console.log(0);

async function test() {
  console.log(1);
}

function test2() {
  console.log(1);
}

function test3() {
  try {
    console.log(1);
  } catch(e) {
    //TODO handle the exception
  }
  
}

/* async function test() {
  try{
    console.log(1);
  } catch(e) {
    //TODO handle the exception
  }
} */