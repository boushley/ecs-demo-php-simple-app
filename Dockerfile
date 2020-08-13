FROM amazonlinux:2

# Install dependencies
RUN yum install -y gcc-c++ make
RUN curl -sL https://rpm.nodesource.com/setup_14.x | bash -
RUN yum install -y nodejs

# Install app
RUN mkdir -p /var/app/
WORKDIR /var/app
COPY src/package*.json /var/app/
RUN npm install
COPY src /var/app
COPY src/public /var/app/public

EXPOSE 80

CMD ["node", "/var/app/index.js"]
