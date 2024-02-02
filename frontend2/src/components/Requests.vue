<template>
  <div>
    <h1>Workers</h1>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th v-for="key in Object.keys(data[0])" :key="key">
              {{ key.toUpperCase() }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="worker in data" :key="worker.id">
            <td>{{ worker.id }}</td>
            <td>{{ worker.fio }}</td>
            <td>{{ worker.tasks }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
defineProps({
  data: {
    required: true,
  },
})
</script>

<style scoped>
h1 {
  text-align: center;
}
.table-container {
  margin-top: 20px;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}
th {
  background-color: #f2f2f2;
}
</style>
