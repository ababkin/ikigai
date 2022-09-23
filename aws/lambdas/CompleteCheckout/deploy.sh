LambdaName=CompleteCheckout
rm -f $LambdaName.zip
zip -r $LambdaName *
aws lambda update-function-code --function-name $LambdaName --zip-file fileb:///Users/ababkin/ikigai/aws/lambdas/${LambdaName}/${LambdaName}.zip