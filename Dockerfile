FROM node:18-alpine
WORKDIR /app
COPY . /app
RUN chmod +x script.sh
CMD ["sh", "./script.sh"]
EXPOSE 3000 
EXPOSE 5000
EXPOSE 4000