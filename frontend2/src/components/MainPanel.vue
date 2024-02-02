<template>
  <div class="wrapper">
    <header class="header">
      <h1>Testing Equipment Fabrique</h1>
    </header>
    <main class="main-content">
      <p>
        Welcome to our testing equipment fabrication center. We ensure top-notch quality in every product we deliver.
      </p>
      <div class="features">
        <div class="feature">
          <h2>High-Quality Testing Equipment</h2>
          <p>Explore our range of cutting-edge testing devices designed for accuracy and reliability.</p>
        </div>
        <div class="feature">
          <h2>Skilled Workforce</h2>
          <p>Meet our dedicated team of professionals committed to delivering excellence in every project.</p>
        </div>
        <div class="feature">
          <h2>Custom Solutions</h2>
          <p>We provide tailored solutions to meet your specific testing requirements. Your success is our priority.</p>
        </div>
      </div>
      <div class="buttons">
        <button @click="goToWorkers" class="btn">Workers</button>
        <button @click="goToRequests" class="btn">Requests</button>
      </div>
    </main>

    <footer class="footer">
      <section class="about-us">
        <h2>About Us</h2>
        <p>
          Welcome to Testing Equipment Fabrique, where innovation meets precision. Our collective dedication fuels our
          mission to revolutionize testing methodologies and contribute to technological advancement.
        </p>
      </section>

      <section class="values">
        <h2>Our Values</h2>
        <p>
          Collaboration <br />
          Integrity <br />
          Innovation
        </p>
      </section>

      <section class="community">
        <h2>Join Our Community</h2>
        <p>
          We believe in the power of community to drive progress. Join us in shaping the future of testing equipment
          technology. Together, we can achieve more than any individual endeavor.
        </p>
      </section>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
defineProps({
  msg: {
    type: String,
    required: true,
  },
})
const data = ref([])

const onclickRequest = async () => {
  try {
    data.value = await AppModel.getRequests()
  } catch (error) {
    console.log('Error fetching in WorkersView.vue, ', error)
    data.value = error
  }
}
const onclickWorders = async () => {
  try {
    data.value = await AppModel.getWorkers()
  } catch (error) {
    console.log('Error fetching in WorkersView.vue, ', error)
    data.value = error
  }
}
</script>

<style>
.wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding: 20px;
}

.feature {
  text-align: center;
  max-width: 300px;
  background-color: #fff;
  padding: 20px;
  border: 1px solid #ddd; /* GitHub border color */
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); /* GitHub box shadow */
  position: relative;
  transition: all 0.3s ease; /* Add transition effect for all properties */
}

.feature:hover {
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2); /* Add shadow on hover */
  transform: scale(1.05); /* Resize on hover */
}

.popup {
  display: none;
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #fff;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1;
}

.feature:hover .popup {
  display: block;
}
body {
  font-family: 'Arial', sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f6f8fa; /* GitHub-like background color */
}
p {
  line-height: 1.6;
  color: #586069; /* GitHub text color */
}
main > p {
  line-height: 1.6;
  color: #586069; /* GitHub text color */
  font-size: 1.2em; /* Increase font size */
  font-style: italic; /* Italicize the text */
  text-align: center;
  margin-bottom: 20px;
}
.header {
  background-color: #24292e; /* GitHub header background color */
  color: #fff;
  padding: 20px;
  text-align: center;
}
.footer {
  display: flex;
  justify-content: space-around;
  background-color: #333; /* Footer background color */
  color: #fff;
  text-align: center;
}
.footer p {
  color: #fff;
}
.footer section {
  flex: 1;
}

.main-content {
  padding: 20px;
}
.features {
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
}

.feature {
  text-align: center;
  max-width: 300px;
  background-color: #fff;
  padding: 20px;
  border: 1px solid #ddd; /* GitHub border color */
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); /* GitHub box shadow */
}

h2 {
  color: #0366d6; /* GitHub link color */
}

.buttons {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.btn {
  padding: 12px 24px;
  font-size: 16px;
  background-color: #28a745; /* GitHub green color */

  border: none;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.btn:hover {
  filter: brightness(1.2); /* Increase brightness on hover */
}

.about-us,
.values,
.community {
  margin-top: 40px;
}

section h2 {
  color: #0366d6; /* GitHub link color */
  border-bottom: 2px solid #e1e4e8; /* GitHub border color */
  padding-bottom: 10px;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  margin-bottom: 5px;
}
</style>
