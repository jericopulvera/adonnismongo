<template>
  <section>
    <div v-bind:class="{ modal: true, 'is-active': isPersonalOff }">
      <div class="modal-background"></div>
      <div class="modal-content">
        <div class="box">
          <h1 class="title">Book Personal Task</h1>
          <div class="box">
            <div class="columns">
              <div class="column is-6">
                <label class="label">Provider</label>
                <span class="subtitle">{{name}}</span>
                <label for="" class="label">Date</label>
                <p class="control"><input id="date-off" class="input" type="date" v-model="personal.vblockDate"></p>
                <label class="checkbox">
                  <input type="checkbox" v-model="personal.fullday">
                Whole Day Off
                </label>
                 <label for="" class="label">Time Period</label>
                <div class="columns">
                  <div class="column is-5">
                    <input id="personal-start" class="input" type="text" v-model="personal.start">
                  </div>
                  <div class="column is-2 has-text-centered">to</div>
                  <div class="column is-5">
                    <input id="personal-end" class="input" type="text" v-model="personal.end">
                  </div>
                </div>
              </div>
              <div class="column is-6">
                <label class="checkbox">
                  <input type="checkbox" v-model="personal.isRepeat">
                  Repeat
                </label>
                <p v-show="personal.isRepeat" class="control"><input id="date-off-end" class="input" type="date" v-model="personal.vendDate"></p>
                <label for="" class="label">Comment</label>
                <p class="control">
                  <textarea name="" id="" cols="30" rows="10" class="textarea" v-model="personal.comment"></textarea>
                </p>
              </div>
            </div>
          </div>
          <div class="level">
            <div class="level-left is-6">
              <a class="button is-danger" @click="deletePersonalTask" v-show="isDeletePersonalOff">Delete</a>
            </div>
            <div class="level-right is-6 block">
              <a class="button is-info" @click="saveOff">Save</a>
              <a class="button is-info" @click="isPersonalOff=false">Cancel</a>
            </div>
          </div>
        </div>
      </div>
      <button class="modal-close" @click="isPersonalOff=false"></button>
    </div>
    <div class='level'>
      <div class='level-left'>

      </div>
      <div class='level-right'>
        <div class='level-item'>
          <a href="javascript:" class="button is-info" @click="isPersonalOff=true">
            <i class="fa fa-plus"></i> &nbsp;
            Personal Task
          </a>
        </div>
      </div>
    </div>
    <div class='columns'>
      <calendar />
    </div>

    <div id="custom_form" v-bind:class="{ modal: true }">
      <div class="modal-content">
        <!--===========================================================
          Start Creating Appointment Timer
        ============================================================-->
        <div class="box" v-show="!isEdit">
          <h1 class="title">Appointment Timer <span style="float:right"> <a class="button" @click="isEdit=true">X</a></span></h1>
          <div class="box has-text-centered">
            <h1 style="font-size:64px;">{{timer}}</h1>
            <span v-show="watchStatus !== 3">
            <button v-if="usertype ==='Agent'" class="button is-large is-info" @click="startWatch" v-show="watchStatus === 0 ">Start</button>
            <div v-show="watchStatus !== 0 && this.isFinished !== true" class="block">
              <button v-if="usertype ==='Agent'" class="button is-large is-info space-btn" @click="pauseWatch" :disabled="pauseAction"><span v-if="watchStatus === 2" id="r">Resume</span><span id="p" v-else>Pause</span></button>
              <button class="button is-large is-danger" @click="stopWatch">Stop</button>
            </div>
            </span>

            <h2 style="font-size:28px;" v-show="isFinished">Job Finished <span @click="closeForm"> <nuxt-link class="phosto-blue" @click="closeForm" :to="`/invoice/${invoice}`" title="Edit"> View Invoice </nuxt-link></span></h2>
          </div>
        </div>

        <!--===========================================================
          Start Creating Appointment
        ============================================================-->
<div v-bind:class="{ modal: true, 'is-active': processing }">
  <div class="modal-background"></div>
  <div class="modal-content has-text-centered">
    <p class="image is-64x64 has-text-centered" style="margin:auto">
     <img src="~assets/img/loading.gif" alt="Bulma logo">
    </p>
  </div>
</div>
        <div class="box" v-show="!isCustomer && isEdit">
          <h1 class="title">Create Appointment for {{name}}</h1>
          <div class="box">

            <div class="columns">
              <div class="column is-2">
                <label class="label">Title</label>
              </div>
              <div class="column is-10">
                <input class="input" type="text" placeholder="Appoinemnt Title" v-model="title">
              </div>
            </div>
            <div class="columns customer-clm">
              <div class="column is-2">
                <label class="label">Customer</label>
              </div>
              <div class="column is-10">
                <div class="field has-addons">
                  <p class="control has-icon has-icon-right">
                    <input v-validate="'required|email'" class="input" type="email" placeholder="Select Customer" name="customer" v-model="customer" @input="searchCustomer($event.target.value)" @keyup.esc="isOpen = false" @blur="isOpen = false" @keydown.down="moveDown" @keydown.up="moveUp" @keydown.enter="selectOption">
                    <span class="icon is-small" v-if="isAdded">
                      <i class="fa fa-check" aria-hidden="true">address</i>
                    </span>
                    <span class="help is-success" v-if="isAdded">Customer with this email has added to your profile!</span>
                    <span class="help is-danger" v-show="errors.has('customer')" >{{ errors.first('customer') }}</span>
                    <!--<div v-if="customer">Address: {{customerData.address1}}, City: {{customerData.city}}, State: {{customerData.state}}, Zip Code: {{customerData.zipCode}}</div>-->
                  </p>
                  <p class="control">
                    <button class="button" @click="isCustomer=true">
                      <i class="fa fa-plus"></i>
                    </button>
                  </p>
                </div>

                <ul class="options-list" v-show="isOpen">
                  <li v-for="(s, index) in searchedCustomers" @click="selectOption" :class="{'highlighted': index === highlightedPosition }" @mouseenter="highlightedPosition = index" @mousedown="selectOption">
                    <h3>{{s.name}}</h3>
                    <h5>{{s.email}}</h5>
                  </li>
                </ul>
              </div>
            </div>

            <div class="columns">
              <div class="column is-2">
                <label class="label">Address</label>
              </div>
              <div class="column is-10">
                <div class="field has-addons">
                  <p class="has-icon has-icon-right">
                    <!--<input v-validate="'required|email'" class="input" type="email" placeholder="Select Customer" name="customer" v-model="customer" @input="searchCustomer($event.target.value)" @keyup.esc="isOpen = false" @blur="isOpen = false" @keydown.down="moveDown" @keydown.up="moveUp" @keydown.enter="selectOption">
                    <span class="icon is-small" v-if="isAdded">
                      <i class="fa fa-check" aria-hidden="true">address</i>
                    </span>
                    <span class="help is-success" v-if="isAdded">Customer with this email has added to your profile!</span>
                    <span class="help is-danger" v-show="errors.has('customer')" >{{ errors.first('customer') }}</span>-->
                    <div v-if="customer"><b>Address 1: </b>{{customerDataShow.address1}}, <b>Address 2: </b> {{customerDataShow.address2}}, <b>City:</b> {{customerDataShow.city}}, <b>State:</b> {{customerDataShow.state}}, <b>Zip Code:</b> {{customerDataShow.zipCode}}</div>
                  </p>
                  <!--<p class="control">
                    <button class="button" @click="isCustomer=true">
                      <i class="fa fa-plus"></i>
                    </button>
                  </p>-->
                </div>

                <ul class="options-list" v-show="isOpen">
                  <li v-for="(s, index) in searchedCustomers" @click="selectOption" :class="{'highlighted': index === highlightedPosition }" @mouseenter="highlightedPosition = index" @mousedown="selectOption">
                    <h3>{{s.name}}</h3>
                    <h5>{{s.email}}</h5>
                  </li>
                </ul>
              </div>
            </div>

            <div class="columns">
              <div class="column is-2">
                <label class="label">Time</label>
              </div>
              <div class="column is-4">
                <input id="start-time" class="input" type="text" v-model="block_time.work_start_time" placeholder="Appoinemnt Time">
              </div>
              <div class="column is-2 has-text-centered">
                <label class="label">To</label>
              </div>
              <div class="column is-4">
                <input id="end-time" class="input" type="text" v-model="block_time.work_end_time" placeholder="Appoinemnt Time">
              </div>
            </div>
            <div class="columns">
              <div class="column is-2">
                <label class="label">Groupon</label>
              </div>
              <div class="column is-10">
                <input class="input" type="text" placeholder="Groupon code" v-model="grouponcode">
              </div>
            </div>
            <div class="columns">
              <div class="column is-2">
                <label class="label">Comment</label>
              </div>
              <div class="column is-10">
                <textarea class="input" type="text" style="height:70px" v-model="comment"></textarea>
              </div>
            </div>
          </div>
          <div class="level">
            <div class="level-left is-9">
              <div class="block">
                <a class="button is-info" name="save" value="Save" id="" @click="save"> Save </a>
                <a class="button is-info" name="close" value="Close" id="" @click="closeForm">Close</a>
                <a class="button is-primary" @click="isEdit = false" v-if="invoice && (invoice_settled == null || invoice_settled === false) && usertype ==='Agent' ">Start Appointment</a>
                <a class=""  v-if="invoice_settled"> <span @click="closeForm"> <nuxt-link class="phosto-blue button is-primary" @click="closeForm" :to="`/invoice/paid/${invoice}`" title="Edit"> View invoice</nuxt-link></span></a>
              </div>
            </div>
            <div class="level-right is-3">
              <button class="button is-danger" @click="remove">Delete</button>
            </div>
          </div>
        </div>

        <!--===========================================================
          Start Creating Customer
        ============================================================-->
        <div class="box" v-show="isCustomer">
          <h2 class="title">Create Customer</h2>
          <div class="box">
            <div class="columns">
              <div class="column is-6">
                <label for="" class="label">Email Address</label>
                <p class="control"><input v-validate="'required|email'" class="input" type="text" name="customer" v-model="customer"></p>
                <span class="help is-danger" v-show="errors.has('customer')" >{{ errors.first('customer') }}</span>
                <label for="" class="label">Name</label>
                <p class="control"><input class="input" type="text" v-model="customerData.name"></p>
                <label for="" class="label">Cell Phone</label>
                <p class="control">
                  <masked-input
                    type="text"
                    name="phone"
                    class="input"
                    v-model="customerData.phone"
                    :mask="['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]"
                    :guide="false"
                    placeholderChar="#">
                  </masked-input>
                </p>
                <label for="" class="label">Address</label>
                <p class="control"><textarea class="textarea" style="min-height:60px !important" v-model="customerData.address1"></textarea></p>
              </div>
              <div class="column is-6">
                <label for="" class="label">Zip</label>
                <p class="control"><input class="input" type="text" v-model="customerData.zipCode"></p>
                <label for="" class="label">City</label>
                <p class="control"><input class="input" type="text" v-model="customerData.city"></p>
                <label for="" class="label">Country</label>
                <p class="control"><input class="input" type="text" v-model="customerData.country"></p>
                <label for="" class="label">State</label>
                <p class="control">
                  <span class="select">
                    <select v-model="customerData.state">
                      <option :value="s.name" v-for="s in states">{{s.name}}</option>
                    </select>
                  </span>
                </p>
              </div>
            </div>
          </div>
          <div class="level">
            <div class="level-left is-6">

            </div>
            <div class="level-right is-6 block">
              <a class="button is-info" @click="addCustomer">Save</a>
              <a class="button is-info" @click="isCustomer=false">Cancel</a>
            </div>
          </div>
        </div>
        <!-- End Creating Customer -->
      </div>
      <button class="modal-close" @click="closeForm"></button>
    </div>
  </section>
</template>
<style>
  .gray {
    background-color: gray
  }
  .phosto-blue {
    color:#3273dc
  }
  		/* enabling marked timespans for month view */
  .dhx_scheduler_month .dhx_marked_timespan {
    display: block;
    overflow: hidden;
  }
  /* style to display special dates, e.g. holidays */
  .holiday {
    background-color: #fadcd3;
    text-align: center;
    font-size: 14px;
    opacity: 0.8;
    color: #e2b8ac;
  }
  .green {
    background-color: rgba(173, 255, 47, 0.25);
    text-align: center;
    font-size: 24px;
    opacity: 0.8;
    color: green;
  }

  .fat_lines_section {
    opacity: 0.15;
  }

  .block a:not(:first-child) {
    margin-left: 10px;
  }
  #custom_form .modal-content {
    overflow: visible !important;
  }
  #custom_form .modal-content .control:first-child {
    width: 100% !important;
  }
  #custom_form .block label {
    margin-right: 10px;
  }
  .customer-clm {
    margin-bottom: 0rem !important;
  }
  .block a.button {
    margin-right: 10px;
  }
  .space-btn {
    margin-right: 10px;
  }
  ul.options-list {
    width: 74%;
  }
</style>
<script>

  import Calendar from '~components/Scheduler.vue'
  import MaskedInput from 'vue-text-mask'
  import helper from '~/plugins/helper'
  export default {
    middleware: 'auth',
    components: {
      Calendar,
      MaskedInput
    },
    head () {
      return {
        title: `Calendar`
      }
    },
    async asyncData ({ store, axios, query }) {
      const id = query.id || 'me'
      let agent = await axios.get(`users/${id}`)
      let event = await axios.get(`appointment/agent/${agent.data._id}`)
      const per = store.state.permissions
    const usertype = store.state.role

      let blockDays = await axios.get(`agent/${agent.data._id}/block-dates`)
      store.commit('SET_HEAD', [`Agent Calendar`, `View appointments of ${agent.data.name}.`])
      let blockTime = agent.data.block_time ? JSON.parse(agent.data.block_time) : [{ day: false, start: '09:00 AM', end: '05:00 PM' }]
      let states = [{name:"Alabama",abbreviation:"AL"},{name:"Alaska",abbreviation:"AK"},{name:"American Samoa",abbreviation:"AS"},{name:"Arizona",abbreviation:"AZ"},{name:"Arkansas",abbreviation:"AR"},{name:"California",abbreviation:"CA"},{name:"Colorado",abbreviation:"CO"},{name:"Connecticut",abbreviation:"CT"},{name:"Delaware",abbreviation:"DE"},{name:"District Of Columbia",abbreviation:"DC"},{name:"Federated States Of Micronesia",abbreviation:"FM"},{name:"Florida",abbreviation:"FL"},{name:"Georgia",abbreviation:"GA"},{name:"Guam",abbreviation:"GU"},{name:"Hawaii",abbreviation:"HI"},{name:"Idaho",abbreviation:"ID"},{name:"Illinois",abbreviation:"IL"},{name:"Indiana",abbreviation:"IN"},{name:"Iowa",abbreviation:"IA"},{name:"Kansas",abbreviation:"KS"},{name:"Kentucky",abbreviation:"KY"},{name:"Louisiana",abbreviation:"LA"},{name:"Maine",abbreviation:"ME"},{name:"Marshall Islands",abbreviation:"MH"},{name:"Maryland",abbreviation:"MD"},{name:"Massachusetts",abbreviation:"MA"},{name:"Michigan",abbreviation:"MI"},{name:"Minnesota",abbreviation:"MN"},{name:"Mississippi",abbreviation:"MS"},{name:"Missouri",abbreviation:"MO"},{name:"Montana",abbreviation:"MT"},{name:"Nebraska",abbreviation:"NE"},{name:"Nevada",abbreviation:"NV"},{name:"New Hampshire",abbreviation:"NH"},{name:"New Jersey",abbreviation:"NJ"},{name:"New Mexico",abbreviation:"NM"},{name:"New York",abbreviation:"NY"},{name:"North Carolina",abbreviation:"NC"},{name:"North Dakota",abbreviation:"ND"},{name:"Northern Mariana Islands",abbreviation:"MP"},{name:"Ohio",abbreviation:"OH"},{name:"Oklahoma",abbreviation:"OK"},{name:"Oregon",abbreviation:"OR"},{name:"Palau",abbreviation:"PW"},{name:"Pennsylvania",abbreviation:"PA"},{name:"Puerto Rico",abbreviation:"PR"},{name:"Rhode Island",abbreviation:"RI"},{name:"South Carolina",abbreviation:"SC"},{name:"South Dakota",abbreviation:"SD"},{name:"Tennessee",abbreviation:"TN"},{name:"Texas",abbreviation:"TX"},{name:"Utah",abbreviation:"UT"},{name:"Vermont",abbreviation:"VT"},{name:"Virgin Islands",abbreviation:"VI"},{name:"Virginia",abbreviation:"VA"},{name:"Washington",abbreviation:"WA"},{name:"West Virginia",abbreviation:"WV"},{name:"Wisconsin",abbreviation:"WI"},{name:"Wyoming",abbreviation:"WY"}];
      let tomorrow = new Date()
      tomorrow.setHours(24)
      return {
        usertype: usertype,
        isEdit: true,
        timer: '00:00:00',
        stopButton: false,
        pauseAction: false,
        id: agent.data._id,
        states,
        events: event.data,
        isFinished: false,
        comment: '',
        grouponcode: '',
        blockDays: blockDays.data,
        title: 'Scanning Session',
        email: agent.data.email,
        name: agent.data.name,
        block_time: blockTime,
        allMarkedId: [],
        searchedCustomers: [],
        customer: '',
        customerData: {
          name: '',
          email: '',
          phone: '',
          address1: '',
          zipCode: '',
          city: '',
          country: 'United States',
          state: ''
        },
        customerDataShow: {
          name: '',
          email: '',
          phone: '',
          address1: '',
          zipCode: '',
          city: '',
          country: 'United States',
          state: ''
        },
        isCustomer: false,
        invoice: null,
        invoice_settled: false,
        isOpen: false,
        watchStatus: 0,
        highlightedPosition: 0,
        isPersonalOff: false,
        isAdded: false,
        personal: {
          vblockDate: new Date().toLocaleDateString(),
          vendDate: new Date().toLocaleDateString(),
          blockDate: new Date(),
          endDate: new Date(),
          fullday: false,
          start: '09:00 AM',
          end: '05:00 PM',
          comment: '',
          isRepeat: false
        },
        isDeletePersonalOff: false,
        isModal: false,
        processing: false,
      }
    },
    data () {
      return {
        axios: this.$root.$options.axios
      }
    },
    mounted () {
      window.calendar = this
      let self = this
      const flatpicker = require('flatpickr')
      var options = { allowInput: false, enableTime: true, noCalendar: true, dateFormat: 'h:i K' }
      let offStartOption = { defaultDate: new Date(), dateFormat: 'm/d/Y' }
      offStartOption.onChange = (date, datestr, instance) => {
        if (!date[0]) return false
        self.personal.blockDate = date[0]
      }
      let offEndOption = { defaultDate: new Date(), dateFormat: 'm/d/Y' }
      offEndOption.onChange = (date, datestr, instance) => {
        if (!date[0]) return false
        self.personal.endDate = date[0]
      }
      new flatpicker(document.getElementById('date-off'), offStartOption)
      new flatpicker(document.getElementById('date-off-end'), offEndOption)
      new flatpicker(document.getElementById('personal-start'), options)
      new flatpicker(document.getElementById('personal-end'), options)

      let startOption = Object.assign({}, options)
      startOption.onChange = (date, datestr, instance) => {

        if (!date[0]) return false
        let dt = new Date(date[0])
        dt.setHours(dt.getHours() + 2)
        dt.setMinutes(dt.getMinutes())
        endTime.setDate(dt)
      }
      let startTime = window.startTime = new flatpicker(document.getElementById('start-time'), startOption)

      let endTime = new flatpicker(document.getElementById('end-time'), options)
      var custom_form = document.getElementById('custom_form')
      scheduler.templates.tooltip_text = function(start,end,ev){
        if (!ev.customer) return
        return `<b>Event:</b> ${ev.text} <br/><b>Start date:</b>
        ${scheduler.templates.tooltip_date_format(start)} <br/><b>End date:</b> ${scheduler.templates.tooltip_date_format(end)}
        <br/><b>Customer:</b> ${ev.customer.name} <br/> <b>Address:</b> ${ev.customer.address1}, ${ev.customer.address2}
        <br/> <b>City:</b> ${ev.customer.city} <br/> <b>State:</b> ${ev.customer.state} <br/> <b>Zip Code:</b> ${ev.customer.zipCode}`
      }

      // =======================================================================
      // Show Popup for Calendar Event Click
      // =======================================================================

      scheduler.showLightbox = function (id) {
        var ev = scheduler.getEvent(id)
        scheduler.startLightbox(id, document.getElementById('custom_form'))
        if (!ev.customer) {
          self.isEdit = true
        }
        self.title = ev.text
        self.customer = ev.customer ? ev.customer.email : ''
        self.comment = ev.comment
        if(ev.customer){
          self.customerData = ev.customer
          self.customerDataShow = ev.customer
        }

        startTime.setDate(ev.start_date)
        let endDate = new Date(ev.start_date)
        endDate.setHours(ev.start_date.getHours() + 2)
        endTime.setDate(endDate)
        let timeFormat = (date) => {
          var hours = date.getHours()
          var minutes = date.getMinutes()
          var ampm = hours >= 12 ? 'PM' : 'AM'
          hours = hours % 12
          hours = hours || 12 // the hour '0' should be '12'
          minutes = minutes < 10 ? '0' + minutes : minutes
          var strTime = hours + ':' + minutes + ' ' + ampm
          return strTime
        }
        self.block_time.work_start_time = timeFormat(ev.start_date)
        self.block_time.work_end_time = timeFormat(endDate)
        if (!ev.watchStatus || ev.watchStatus === 0) {
          self.timer = '00:00:00'
          ev.watchStatus = 0
          self.isFinished = false
        } else {
          self.startWatch()

        }
        self.invoice = ev._id
        self.invoice_settled = ev.invoice_settled
        self.watchStatus = ev.watchStatus

      }

      // =======================================================================
      // Show event
      // =======================================================================
      var events = []
      this.events.forEach(m => {
        events.push({
          id: m._id,
          _id: m._id,
          text: m.description,
          start_date: new Date(m.start_time),
          end_date: new Date(m.start_time),
          customer: m.customer,
          agent: m.agent.email,
          comment: m.comment,
          watchStatus: m.watchStatus,
          prevDiff: m.totalDiff,
          started: m.started,
          invoice_settled: m.invoice_settled,
          ended: m.ended
        })
      })
      // =======================================================================
      // Block Times Array
      // =======================================================================
      this.block_time.forEach((b, i) => {
        let off
        if (typeof b.day === 'number') {
          off = {
            days: b.day,
            zones: 'fullday',
            css: 'holiday',
            html: 'Off Day',
            type: 'dhx_time_block'
          }
        } else {
          const startMinute = helper.convertTimetoInt(b.start)
          const endMinute = helper.convertTimetoInt(b.end)
          off = {
            days: i,
            zones: [startMinute, endMinute],
            invert_zones: true,
            type: 'dhx_time_block',
            css: 'fat_lines_section'
          }
        }
        scheduler.addMarkedTimespan(off)
        self.allMarkedId.push(off)
      })
      // =======================================================================
      // Personal Off Array
      // =======================================================================
      function showPersonalTask (id) {
        this.showPersonalTask(id)
      }
      this.blockDays.forEach((b) => {

        const startMinute = helper.convertTimetoInt(b.start)
        const endMinute = helper.convertTimetoInt(b.end)
        let date = new Date(b.blockDate)
        date.setHours(0, 0, 0)
        let day = {
          _id: `${b._id}`,
          days: b.isRepeat ? date.getDay() : date,
          zones: b.fullday ? 'fullday' : [startMinute, endMinute],
          css: 'holiday',
          html: `<a href="javascript:" title="Personal Task" class="phosto-blue" onclick="calendar.showPersonalTask('${b._id}')">Personal Task</a>`,
          type: 'dhx_time_block'
        }
        if (b.isRepeat) {
          day.start_date = date
          let endDate = new Date(b.endDate)
          endDate.setHours(24, 0, 0)
          day.end_date = endDate
        }
        scheduler.addMarkedTimespan(day)
        self.allMarkedId.push(day)
      })

      scheduler.parse(events, 'json')
      // scheduler.addMarkedTimespan(workingHour)

      // scheduler.addMarkedTimespan(offDay)

      scheduler.updateView()
    },
    destroyed () {
      this.events = []
      this.allMarkedId.forEach((e) => {
        scheduler.deleteMarkedTimespan(e)
      })
      this.block_time = {}
      this.allMarkedId = []
      this.title = 'Scanning Session'
    },
    methods: {
      // =======================================================================
      // Save Appointment
      // =======================================================================
      async save () {
        this.processing = true// processing image load active
        let id = scheduler.getState().lightbox_id
        let ev = scheduler.getEvent(id)
        if (this.errors.any()) {
          return
        }
        const startMinute = helper.convertTimetoInt(this.block_time.work_start_time)
        ev.start_date.setHours(0, 0, 0)
        ev.start_date.setMinutes(startMinute)
        const obj = { _id: ev._id, agent: this.email, description: this.title, grouponcode: this.grouponcode,  customer: this.customer, start: ev.start_date, comment: this.comment}
        let { data } = await this.axios.post('appointment', obj)
        this.processing = false// processing image loading deactive
        ev.customer = data.customer
        ev.text = data.description
        ev.comment = data.comment
        // ev.invoice_settled = false
        ev._id = data._id
        scheduler.endLightbox(true, document.getElementById('custom_form'))
        this.isCustomer = false
      },
      // =======================================================================
      // Save Personal Off
      // =======================================================================
      async saveOff () {
          if (this.errors.any()) {
            return
          }
          if (this.personal._id) {
            for (var i = 0; i < this.blockDays.length; i++ ) {
              let off = this.blockDays[i]

              if (off._id && off._id === this.personal._id) {
                this.blockDays.slice(i, 1)
                break;
              }
            }
            for (var i = 0; i < this.allMarkedId.length; i++ ) {
              let off = this.allMarkedId[i]

              if (off._id && off._id === this.personal._id) {
                scheduler.deleteMarkedTimespan(off)
                scheduler.updateView()
                this.allMarkedId.splice(i, 1)
                break;
              }
            }
          }
          this.isAdded = false
          this.personal.blockDate = new Date(this.personal.blockDate)
          this.personal.endDate = new Date(this.personal.endDate)
          this.personal.blockDate.setHours(0, 0, 0)

          
          console.log(this.personal)
          const { data } = await this.axios.post(`agent/${this.id}/block-date`, this.personal)
          this.personal.endDate.setHours(24, 0, 0)
          this.blockDays.push(data)
          const startMinute = helper.convertTimetoInt(this.personal.start)
          const endMinute = helper.convertTimetoInt(this.personal.end)
          let date = new Date(this.personal.blockDate)
           date =  date.setHours(0, 0, 0)

          let offDay = {
            _id: `${data._id}`,
            days: this.personal.isRepeat ? this.personal.blockDate.getDay() : this.personal.blockDate,
            zones: this.personal.fullday ? 'fullday' : [startMinute, endMinute],
            css: 'holiday',
            html: `<a href="javascript:" title="Personal Task" class="phosto-blue" onclick="calendar.showPersonalTask('${data._id}')">Personal Task</a>`,
            type: 'dhx_time_block'
          }
          if (this.personal.isRepeat) {
            offDay.start_date = this.personal.blockDate
            offDay.end_date = this.personal.endDate
          }
          scheduler.addMarkedTimespan(offDay)
          this.allMarkedId.push(offDay)
          scheduler.endLightbox(false, document.getElementById('custom_form'))
          scheduler.updateView()

          this.isPersonalOff = false
      },
      // =======================================================================
      // Remove Personal Off
      // =======================================================================
      async remove () {
        let id = scheduler.getState().lightbox_id
        let ev = scheduler.getEvent(id)
        let { date } = await this.axios.delete(`appointment/${ev._id}`)
        scheduler.deleteEvent(id)
        scheduler.endLightbox(false, document.getElementById('custom_form'))
        scheduler.deleteEvent(id)
      },
      closeForm () {
        this.isPersonalOff = false
        this.isAdded = false
        if (this.isAgent) {
          this.isEdit = false
        }
        clearInterval(this.sw)
        scheduler.endLightbox(false, document.getElementById('custom_form'))
      },
      // =======================================================================
      // Add Customer to the System
      // =======================================================================
      async addCustomer () {
        if (this.customer && !this.errors.has('customer')) {
          this.customerData.email = this.customer
          const { data } = await this.axios.post('customers', this.customerData)
          console.log(data)
          await this.axios.get(`agent/${this.id}/assign-customer/${data._id}`)
          this.isAdded = true
          this.isCustomer = false
          this.customerData = {}
          this.customerDataShow.address1 = data.address1
          this.customerDataShow.city = data.city
          this.customerDataShow.state = data.state
          this.customerData.country = 'United States'
          this.customerDataShow.zipCode = data.zipCode
        }
      },
      async searchCustomer (value) {
        this.highlightedPosition = 0
        this.isAdded = false
        if (value) {
          let { data } = await this.axios.get(`customer/search?agent=${this.id}&key=${value}`)
          this.searchedCustomers = data || []
          this.isOpen = this.searchedCustomers.length > 0
        }
      },
      showPersonalTask (id) {
        this.isPersonalOff = true

        for (var i = 0; i < this.blockDays.length; i++ ) {
          let off = this.blockDays[i]

          if (off._id && off._id === id) {
            this.personal = off
            this.personal.vblockDate = (new Date(this.personal.blockDate)).toLocaleDateString()
            this.personal.vendDate = (new Date(this.personal.endDate)).toLocaleDateString()
            break;
          }
        }
        this.isDeletePersonalOff = true

      },
      async deletePersonalTask() {
        var self = this
        const id = this.personal._id
        let d = new Date(this.personal.blockDate)
        console.log(this.personal.blockDate)
        await this.axios.delete(`agent/${this.id}/block-date/${id}`)
        for (var i = 0; i < this.allMarkedId.length; i++ ) {
          let off = this.allMarkedId[i]
          if (off._id && off._id === id) {
            scheduler.deleteMarkedTimespan(off)
            scheduler.updateView()
            this.allMarkedId.splice(i, 1)
            break;
          }
        }
        let b = this.block_time[d.getDay()]
        if(!b){
          self.isPersonalOff = false
        self.isDeletePersonalOff = false
        return false
        }
        var off = []
        if (typeof b.day === 'number') {
          off.push({
            days: d,
            zones: 'fullday',
            css: 'holiday',
            html: 'Off Day',
            type: 'dhx_time_block'
          })
        } else {
          function setBlockTime (dt) {
            let bT = self.block_time[dt.getDay()]
            const startMinute = helper.convertTimetoInt(bT.start)
            const endMinute = helper.convertTimetoInt(bT.end)
            off.push({
              days: new Date(dt),
              zones: [startMinute, endMinute],
              invert_zones: true,
              type: 'dhx_time_block',
              css: 'fat_lines_section'
            })
          }
          if (this.personal.isRepeat) {
            let sd = new Date(this.personal.blockDate)
            let ed = new Date(this.personal.vendDate)
            while (sd <= ed) {
              setBlockTime(sd)
              sd.setHours(24,0,0)
            }
          } else {
           setBlockTime(d)
          }
        }
        off.forEach(function(offVal){
          scheduler.addMarkedTimespan(offVal)
          scheduler.updateView()
          self.allMarkedId.push(offVal)
        })
        self.isPersonalOff = false
        self.isDeletePersonalOff = false
      },
      moveDown () {
        if (!this.isOpen) {
          return
        }
        this.highlightedPosition = (this.highlightedPosition + 1) % this.searchedCustomers.length
      },
      moveUp () {
        if (!this.isOpen) {
          return
        }
        this.highlightedPosition = this.highlightedPosition - 1 < 0 ? this.searchedCustomers.length - 1 : this.highlightedPosition - 1
      },
      selectOption (customer) {
        this.customer = this.searchedCustomers[this.highlightedPosition].email
        this.customerData.address1 = this.searchedCustomers[this.highlightedPosition].address1
        this.customerData.address2 = this.searchedCustomers[this.highlightedPosition].address2
        this.customerData.city = this.searchedCustomers[this.highlightedPosition].city
        this.customerData.state = this.searchedCustomers[this.highlightedPosition].state
        this.customerData.zipCode = this.searchedCustomers[this.highlightedPosition].zipCode
        this.customerData.country = this.searchedCustomers[this.highlightedPosition].country
        this.isOpen = false
        console.log(this.customerData)
      },
      async startWatch () {
        let self = this
        this.isFinshed = false
        let id = scheduler.getState().lightbox_id
        let ev = scheduler.getEvent(id)
        let totalDiff = ev.prevDiff || 0
        this.watchStatus = ev.watchStatus
        function toTimeString (now, countDownDate, prevDiff) {

          var distance =  now - countDownDate + prevDiff;
          ev.totalDiff = distance

          var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
          var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
          var seconds = Math.floor((distance % (1000 * 60)) / 1000)

          // Output the result in an element with id="demo"
          self.timer = `${('00'+hours).slice(-2)}:${('00'+minutes).slice(-2)}:${('00'+seconds).slice(-2)}`
        }
        // Set the date we're counting down to

        if (ev.watchStatus === 3) {

          toTimeString(0, 0, totalDiff)
          this.isFinished = true
          return

        } else if (ev.watchStatus === 1) {

          var countDownDate = ev.started

        } else if (ev.watchStatus === 2) {
          toTimeString(0, 0, totalDiff)
          return

        } else {
          var countDownDate = new Date().getTime();
          let startResult = await this.axios.post('appointment/start', { _id: ev._id, start: countDownDate })
          ev.started = countDownDate
          this.watchStatus = ev.watchStatus = 1
        }
        this.stopButton = true

        this.sw = setInterval(function () {
          var now = new Date().getTime()
          toTimeString(now, ev.started, totalDiff)
        }, 1000)

        // Update the count down every 1 second

      },
      async pauseWatch (e) {
        this.pauseAction = true
        let id = scheduler.getState().lightbox_id
        let ev = scheduler.getEvent(id)
        if (ev.watchStatus === 1) {
          clearInterval(this.sw)
          ev.watchStatus = 2
          ev.prevDiff = ev.totalDiff
        } else if (ev.watchStatus === 2) {
          ev.watchStatus = 1
          ev.started = new Date().getTime()
        }

        let resultDb =  await this.axios.post('appointment/pause', { _id: ev._id, paused: ev.watchStatus, start: ev.started, total: ev.totalDiff })


        await this.startWatch()
        this.pauseAction = false
      },
      async stopWatch () {
        clearInterval(this.sw)
        let id = scheduler.getState().lightbox_id
        let ev = scheduler.getEvent(id)
        await this.axios.post('appointment/stop', { _id: ev._id, totalDiff: ev.totalDiff, end: new Date().getTime() })
        this.stopButton = false
        this.isFinished = true
      }
    }
  }
</script>
